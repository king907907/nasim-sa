/** Turn an iPhone MediaRecorder fragmented MP4 (iso5/hlsf) into one Safari can play. */

const textDecoder = new TextDecoder("latin1");

function u32(value: number): Buffer {
  const out = Buffer.alloc(4);
  out.writeUInt32BE(value >>> 0, 0);
  return out;
}

function box(type: string, body: Buffer): Buffer {
  return Buffer.concat([u32(body.length + 8), Buffer.from(type), body]);
}

type Atom = { type: string; start: number; size: number; header: number };

function atoms(buf: Buffer, start: number, end: number): Atom[] {
  const out: Atom[] = [];
  let cursor = start;
  while (cursor + 8 <= end) {
    let size = buf.readUInt32BE(cursor);
    const type = buf.toString("latin1", cursor + 4, cursor + 8);
    let header = 8;
    if (size === 1 && cursor + 16 <= end) {
      size = Number(buf.readBigUInt64BE(cursor + 8));
      header = 16;
    }
    if (size < header || cursor + size > end) break;
    out.push({ type, start: cursor, size, header });
    cursor += size;
  }
  return out;
}

function children(buf: Buffer, atom: Atom): Atom[] {
  return atoms(buf, atom.start + atom.header, atom.start + atom.size);
}

function findBox(buf: Buffer, start: number, end: number, type: string): Atom | null {
  for (const atom of atoms(buf, start, end)) {
    if (atom.type === type) return atom;
    if (atom.type === "trak" || atom.type === "mdia" || atom.type === "minf" || atom.type === "stbl" || atom.type === "moov") {
      const nested = findBox(buf, atom.start + atom.header, atom.start + atom.size, type);
      if (nested) return nested;
    }
  }
  return null;
}

function sliceBox(buf: Buffer, atom: Atom): Buffer {
  return buf.subarray(atom.start, atom.start + atom.size);
}

export function isFragmentedMp4(bytes: Uint8Array): boolean {
  const head = Buffer.from(bytes.subarray(0, Math.min(bytes.byteLength, 64))).toString("latin1");
  if (head.includes("iso5") || head.includes("hlsf")) return true;
  const scan = Buffer.from(bytes.subarray(0, Math.min(bytes.byteLength, 2_000_000))).toString("latin1");
  return scan.includes("mvex");
}

type Sample = { duration: number; size: number; data: Buffer };
type Track = {
  id: number;
  timescale: number;
  tkhd: Buffer;
  mdhd: Buffer;
  hdlr: Buffer;
  media: Buffer;
  dinf: Buffer;
  stsd: Buffer;
  samples: Sample[];
};

function readTrackId(tkhd: Buffer): number {
  const version = tkhd[8] ?? 0;
  return tkhd.readUInt32BE(version === 0 ? 20 : 28);
}

function readTimescale(mdhd: Buffer): number {
  const version = mdhd[8] ?? 0;
  return mdhd.readUInt32BE(version === 0 ? 20 : 28);
}

function patchU32(blob: Buffer, offset: number, value: number): Buffer {
  const next = Buffer.from(blob);
  next.writeUInt32BE(value >>> 0, offset);
  return next;
}

export function flattenPhoneMp4(bytes: Uint8Array): Uint8Array {
  if (!isFragmentedMp4(bytes)) return bytes;
  const buf = Buffer.from(bytes);
  const top = atoms(buf, 0, buf.length);
  const moov = top.find((atom) => atom.type === "moov");
  if (!moov) return bytes;
  const tracks: Track[] = [];
  for (const atom of children(buf, moov)) {
    if (atom.type !== "trak") continue;
    const tkhd = findBox(buf, atom.start + atom.header, atom.start + atom.size, "tkhd");
    const mdhd = findBox(buf, atom.start + atom.header, atom.start + atom.size, "mdhd");
    const hdlr = findBox(buf, atom.start + atom.header, atom.start + atom.size, "hdlr");
    const vmhd = findBox(buf, atom.start + atom.header, atom.start + atom.size, "vmhd");
    const smhd = findBox(buf, atom.start + atom.header, atom.start + atom.size, "smhd");
    const dinf = findBox(buf, atom.start + atom.header, atom.start + atom.size, "dinf");
    const stsd = findBox(buf, atom.start + atom.header, atom.start + atom.size, "stsd");
    const media = vmhd ?? smhd;
    if (!tkhd || !mdhd || !hdlr || !media || !dinf || !stsd) continue;
    const tkhdBytes = sliceBox(buf, tkhd);
    const mdhdBytes = sliceBox(buf, mdhd);
    tracks.push({
      id: readTrackId(tkhdBytes),
      timescale: readTimescale(mdhdBytes),
      tkhd: tkhdBytes,
      mdhd: mdhdBytes,
      hdlr: sliceBox(buf, hdlr),
      media: sliceBox(buf, media),
      dinf: sliceBox(buf, dinf),
      stsd: sliceBox(buf, stsd),
      samples: [],
    });
  }
  const byId = new Map(tracks.map((track) => [track.id, track]));
  for (const atom of top) {
    if (atom.type !== "moof") continue;
    for (const child of children(buf, atom)) {
      if (child.type !== "traf") continue;
      let trackId = 0;
      let defaultDuration = 0;
      let defaultSize = 0;
      let base = atom.start;
      const runs: { offset: number | null; samples: { duration: number | null; size: number | null }[] }[] = [];
      for (const boxAtom of children(buf, child)) {
        const body = buf.subarray(boxAtom.start + boxAtom.header, boxAtom.start + boxAtom.size);
        if (boxAtom.type === "tfhd") {
          const flags = body.readUInt32BE(0) & 0xffffff;
          trackId = body.readUInt32BE(4);
          let cursor = 8;
          if (flags & 0x1) {
            base = Number(body.readBigUInt64BE(cursor));
            cursor += 8;
          }
          if (flags & 0x2) cursor += 4;
          if (flags & 0x8) {
            defaultDuration = body.readUInt32BE(cursor);
            cursor += 4;
          }
          if (flags & 0x10) {
            defaultSize = body.readUInt32BE(cursor);
            cursor += 4;
          }
          if ((flags & 0x20000) === 0 && (flags & 0x1) === 0) base = 0;
        } else if (boxAtom.type === "trun") {
          const flags = body.readUInt32BE(0) & 0xffffff;
          const count = body.readUInt32BE(4);
          let cursor = 8;
          let offset: number | null = null;
          if (flags & 0x1) {
            offset = body.readInt32BE(cursor);
            cursor += 4;
          }
          if (flags & 0x4) cursor += 4;
          const samples: { duration: number | null; size: number | null }[] = [];
          for (let index = 0; index < count; index += 1) {
            let duration: number | null = null;
            let size: number | null = null;
            if (flags & 0x100) {
              duration = body.readUInt32BE(cursor);
              cursor += 4;
            }
            if (flags & 0x200) {
              size = body.readUInt32BE(cursor);
              cursor += 4;
            }
            if (flags & 0x400) cursor += 4;
            if (flags & 0x800) cursor += 4;
            samples.push({ duration, size });
          }
          runs.push({ offset, samples });
        }
      }
      const track = byId.get(trackId);
      if (!track) continue;
      let cursor: number | null = null;
      for (const run of runs) {
        if (run.offset !== null) cursor = base + run.offset;
        for (const sample of run.samples) {
          const duration = sample.duration ?? defaultDuration;
          const size = sample.size ?? defaultSize;
          if (cursor === null || size < 0 || cursor + size > buf.length) throw new Error("bad fragment");
          track.samples.push({ duration, size, data: Buffer.from(buf.subarray(cursor, cursor + size)) });
          cursor += size;
        }
      }
    }
  }
  const ready = tracks.filter((track) => track.samples.length > 0);
  if (ready.length === 0) return bytes;
  ready.sort((a, b) => Number(b.stsd.includes("avc1") || b.stsd.includes("avc3")) - Number(a.stsd.includes("avc1") || a.stsd.includes("avc3")));

  const payload = Buffer.concat(ready.map((track) => Buffer.concat(track.samples.map((sample) => sample.data))));
  const durations = ready.map((track) => Math.max(1, Math.round((track.samples.reduce((sum, sample) => sum + sample.duration, 0) / track.timescale) * 1000)));
  const movieDuration = Math.max(...durations);
  const ftyp = box("ftyp", Buffer.concat([Buffer.from("isom"), u32(512), Buffer.from("isomiso2avc1mp41")]));

  const buildMoov = (chunkOffsets: number[]) => {
    const traks = ready.map((track, index) => {
      const mediaDuration = track.samples.reduce((sum, sample) => sum + sample.duration, 0);
      const runs: { duration: number; count: number }[] = [];
      for (const sample of track.samples) {
        const last = runs[runs.length - 1];
        if (last && last.duration === sample.duration) last.count += 1;
        else runs.push({ duration: sample.duration, count: 1 });
      }
      const stts = box("stts", Buffer.concat([Buffer.alloc(4), u32(runs.length), ...runs.map((run) => Buffer.concat([u32(run.count), u32(run.duration)]))]));
      const stsc = box("stsc", Buffer.concat([Buffer.alloc(4), u32(1), u32(1), u32(track.samples.length), u32(1)]));
      const stsz = box("stsz", Buffer.concat([Buffer.alloc(4), u32(0), u32(track.samples.length), ...track.samples.map((sample) => u32(sample.size))]));
      const stco = box("stco", Buffer.concat([Buffer.alloc(4), u32(1), u32(chunkOffsets[index] ?? 0)]));
      const stbl = box("stbl", Buffer.concat([track.stsd, stts, stsc, stsz, stco]));
      const minf = box("minf", Buffer.concat([track.media, track.dinf, stbl]));
      const mdhd = track.mdhd[8] === 0 ? patchU32(track.mdhd, 24, mediaDuration) : track.mdhd;
      const mdia = box("mdia", Buffer.concat([mdhd, track.hdlr, minf]));
      const tkhd = track.tkhd[8] === 0 ? patchU32(track.tkhd, 28, durations[index] ?? 1) : track.tkhd;
      return box("trak", Buffer.concat([tkhd, mdia]));
    });
    const mvhd = Buffer.alloc(100);
    mvhd.writeUInt32BE(1000, 12);
    mvhd.writeUInt32BE(movieDuration, 16);
    mvhd.writeUInt32BE(0x00010000, 20);
    mvhd.writeUInt16BE(0x0100, 24);
    mvhd.writeUInt32BE(0x00010000, 36);
    mvhd.writeUInt32BE(0x00010000, 52);
    mvhd.writeUInt32BE(0x40000000, 68);
    mvhd.writeUInt32BE(ready.length + 1, 96);
    return box("moov", Buffer.concat([box("mvhd", mvhd), ...traks]));
  };

  const probe = buildMoov(ready.map(() => 0));
  let cursor = ftyp.length + probe.length + 8;
  const offsets = ready.map((track) => {
    const offset = cursor;
    cursor += track.samples.reduce((sum, sample) => sum + sample.size, 0);
    return offset;
  });
  const moovOut = buildMoov(offsets);
  const mdat = box("mdat", payload);
  const file = Buffer.concat([ftyp, moovOut, mdat]);
  if (textDecoder.decode(file.subarray(4, 8)) !== "ftyp") return bytes;
  return new Uint8Array(file);
}
