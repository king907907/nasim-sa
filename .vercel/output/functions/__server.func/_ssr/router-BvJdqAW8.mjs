import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, n as QueryClientProvider, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { c as jsonResponse, d as regionAlertLevels, i as SA_REGIONS, l as radarFrames, m as searchPlaces, o as getField, p as reversePlace, s as getForecast, u as readCoord } from "./met.server-4E0qbmIX.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { join } from "node:path";
import { mkdtemp, open, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BvJdqAW8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CrVLPsb7.css";
var queryClient = new QueryClient({ defaultOptions: { queries: {
	retry: 1,
	refetchOnWindowFocus: false
} } });
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "نَسيم" },
			{
				name: "description",
				content: "نَسيم — خريطة طقس حية وتوقعات دقيقة للمدن"
			},
			{
				name: "theme-color",
				content: "#07090c"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "نَسيم"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/naseem-touch-180.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/naseem-touch-180.png"
			},
			{
				rel: "apple-touch-icon-precomposed",
				href: "/naseem-touch-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
				client: queryClient,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadHomeForecast = createServerFn({ method: "GET" }).handler(createSsrRpc("5351974dffcec6ec530cb744cfd6a945dac25a363cccae9fac791e2e5591b958"));
var $$splitComponentImporter = () => import("./routes-jS8HFSfK.mjs");
var Route$7 = createFileRoute("/")({
	loader: () => loadHomeForecast(),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$6 = createFileRoute("/api/field")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const s = readCoord(url.searchParams.get("s"), -75, 75);
	const n = readCoord(url.searchParams.get("n"), -75, 75);
	const w = readCoord(url.searchParams.get("w"), -180, 180);
	const e = readCoord(url.searchParams.get("e"), -180, 180);
	if (s == null || n == null || w == null || e == null) return jsonResponse({ error: "bad bounds" }, 400);
	if (Math.abs(n - s) > 50 || Math.abs(e - w) > 50) return jsonResponse({ error: "bounds too wide" }, 400);
	try {
		return jsonResponse(await getField(s, w, n, e));
	} catch (error) {
		console.error("[naseem] field", error);
		return jsonResponse({ error: "field failed" }, 502);
	}
} } } });
var Route$5 = createFileRoute("/api/forecast")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const lat = readCoord(url.searchParams.get("lat"), -80, 80);
	const lon = readCoord(url.searchParams.get("lon"), -180, 180);
	if (lat == null || lon == null) return jsonResponse({ error: "bad coords" }, 400);
	try {
		return jsonResponse(await getForecast(lat, lon));
	} catch (error) {
		console.error("[naseem] forecast", error);
		return jsonResponse({ error: "forecast failed" }, 502);
	}
} } } });
var Route$4 = createFileRoute("/api/geocode")({ server: { handlers: { GET: async ({ request }) => {
	const q = new URL(request.url).searchParams.get("q") ?? "";
	if (q.trim().length < 2 || q.length > 60) return jsonResponse({ places: [] });
	return jsonResponse({ places: await searchPlaces(q) });
} } } });
var Route$3 = createFileRoute("/api/radar")({ server: { handlers: { GET: async () => jsonResponse({ frames: await radarFrames() }) } } });
var _0002_rain_clips_default = "create table if not exists rain_clips (\n  id text primary key,\n  region_id text not null,\n  place text not null,\n  intensity text not null,\n  mime text not null,\n  bytes bytea not null,\n  created_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_rain_clips.sql": _0002_rain_clips_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var RAIN_LABEL = {
	light: "أمطار خفيفة",
	moderate: "أمطار متوسطة",
	heavy: "أمطار غزيرة",
	extreme: "أمطار غزيرة جداً"
};
var SEED_CLIPS = [{
	id: "seed-jazan-2",
	regionId: "SA-09",
	place: "جازان",
	level: "extreme",
	src: "/rain/jazan-2.mp4",
	caption: "القطرات تنزل بقوة على الأرضية الخشبية والبلاط في جازان، والسطح كله مبتل.",
	at: "2026-11-11T06:43:00+03:00"
}];
function describeRain(level, place, region) {
	const where = `${place} في ${region}`;
	if (level === "extreme") return `أمطار غزيرة جداً على ${where}. الهطول كثيف، والمياه ظاهرة على الأرض.`;
	if (level === "heavy") return `أمطار غزيرة على ${where}. المطر قوي والسطوح مبتلة.`;
	if (level === "moderate") return `أمطار متوسطة على ${where}. الهطول مستمر وواضح.`;
	return `أمطار خفيفة على ${where}. زخات خفيفة مرت على المكان.`;
}
function formatClipStamp(iso) {
	const date = new Date(iso);
	if (!Number.isFinite(date.getTime())) return "";
	return `${new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", {
		timeZone: "Asia/Riyadh",
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date)} · ${new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Riyadh",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).format(date)}`;
}
var LEVELS = [
	"light",
	"moderate",
	"heavy",
	"extreme"
];
function isRainLevel(value) {
	return LEVELS.includes(value);
}
/** Gray frames, tightly packed, row-major. Used by the upload check. */
function classifyGray(packed, width, height, count) {
	const frame = width * height;
	if (count < 3 || packed.length < frame * count) return {
		ok: false,
		reason: "الفيديو قصير وما يبيّن مطراً"
	};
	const details = [];
	for (let n = 0; n < count - 1; n += 1) {
		const a = n * frame;
		const b = (n + 1) * frame;
		if (meanAbs(packed, a, b, width, height, 2) > 36) continue;
		const ba = blur(packed, a, width, height);
		const bb = blur(packed, b, width, height);
		const [dx, dy] = bestShift(ba, bb, width, height);
		const structure = shiftedMean(ba, 0, bb, 0, width, height, dx, dy);
		const detail = detailShift(packed, a, b, ba, bb, width, height, dx, dy);
		if (structure > 6.5) continue;
		if (detail >= 2.15 && detail > structure * 1.05) details.push(detail);
	}
	if (details.length >= 2) {
		const detail = avg(details);
		const peak = Math.max(...details);
		let level = "light";
		if (detail >= 3.7 && peak >= 4.6) level = "extreme";
		else if (detail >= 3) level = "heavy";
		else if (detail >= 2.45) level = "moderate";
		return {
			ok: true,
			level,
			score: detail
		};
	}
	const drops = glassDrops(packed, width, height, count);
	if (drops.filter((value) => value >= 22).length >= Math.min(4, count - 1)) {
		const amount = avg(drops);
		return {
			ok: true,
			level: amount >= 120 ? "extreme" : amount >= 36 ? "heavy" : "moderate",
			score: amount
		};
	}
	return {
		ok: false,
		reason: "الفيديو لا يظهر مطراً أو حالة جوية"
	};
}
function glassDrops(src, width, height, count) {
	const frame = width * height;
	const y0 = Math.floor(height * .22);
	const y1 = Math.floor(height * .78);
	const counts = [];
	for (let n = 0; n < count; n += 1) {
		const offset = n * frame;
		let drops = 0;
		for (let y = y0; y < y1; y += 2) for (let x = 6; x < width - 6; x += 2) {
			const i = offset + y * width + x;
			const center = src[i] ?? 0;
			let sum = 0;
			let darker = 0;
			let samples = 0;
			for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) {
				if (!dx && !dy) continue;
				const value = src[i + dy * width + dx] ?? 0;
				sum += value;
				samples += 1;
				if (center + 3 < value) darker += 1;
			}
			const contrast = sum / samples - center;
			const edge = Math.abs((src[i + 4] ?? 0) - (src[i - 4] ?? 0)) + Math.abs((src[i + 4 * width] ?? 0) - (src[i - 4 * width] ?? 0));
			if (contrast > 4 && contrast < 26 && darker > 14 && edge < 36) drops += 1;
		}
		counts.push(drops);
	}
	return counts;
}
function avg(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function meanAbs(data, a, b, width, height, step) {
	let sum = 0;
	let n = 0;
	for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
		const i = y * width + x;
		sum += Math.abs((data[a + i] ?? 0) - (data[b + i] ?? 0));
		n += 1;
	}
	return n ? sum / n : 0;
}
function blur(data, offset, width, height) {
	const out = new Float32Array(width * height);
	for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
		let sum = 0;
		for (let dy = -2; dy <= 2; dy += 1) {
			const yy = Math.min(height - 1, Math.max(0, y + dy));
			for (let dx = -2; dx <= 2; dx += 1) {
				const xx = Math.min(width - 1, Math.max(0, x + dx));
				sum += data[offset + yy * width + xx] ?? 0;
			}
		}
		out[y * width + x] = sum / 25;
	}
	return out;
}
function bestShift(a, b, width, height) {
	let best = 1e9;
	let pick = [0, 0];
	const score = (dx, dy, step) => {
		let sum = 0;
		let n = 0;
		const y0 = Math.max(0, -dy);
		const y1 = Math.min(height, height - dy);
		const x0 = Math.max(0, -dx);
		const x1 = Math.min(width, width - dx);
		for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
			sum += Math.abs((a[y * width + x] ?? 0) - (b[(y + dy) * width + (x + dx)] ?? 0));
			n += 1;
		}
		return n ? sum / n : 1e9;
	};
	for (let dy = -10; dy <= 10; dy += 2) for (let dx = -10; dx <= 10; dx += 2) {
		const value = score(dx, dy, 2);
		if (value < best) {
			best = value;
			pick = [dx, dy];
		}
	}
	const [cx, cy] = pick;
	for (let dy = cy - 1; dy <= cy + 1; dy += 1) for (let dx = cx - 1; dx <= cx + 1; dx += 1) {
		if (Math.abs(dx) > 10 || Math.abs(dy) > 10) continue;
		const value = score(dx, dy, 1);
		if (value < best) {
			best = value;
			pick = [dx, dy];
		}
	}
	return pick;
}
function shiftedMean(a, ao, b, bo, width, height, dx, dy) {
	let sum = 0;
	let n = 0;
	const y0 = Math.max(0, -dy);
	const y1 = Math.min(height, height - dy);
	const x0 = Math.max(0, -dx);
	const x1 = Math.min(width, width - dx);
	for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
		sum += Math.abs((a[ao + y * width + x] ?? 0) - (b[bo + (y + dy) * width + (x + dx)] ?? 0));
		n += 1;
	}
	return n ? sum / n : 0;
}
function detailShift(src, a, b, ba, bb, width, height, dx, dy) {
	let sum = 0;
	let n = 0;
	const y0 = Math.max(0, -dy);
	const y1 = Math.min(height, height - dy);
	const x0 = Math.max(0, -dx);
	const x1 = Math.min(width, width - dx);
	for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
		const i = y * width + x;
		const j = (y + dy) * width + (x + dx);
		const da = (src[a + i] ?? 0) - (ba[i] ?? 0);
		const db = (src[b + j] ?? 0) - (bb[j] ?? 0);
		sum += Math.abs(da - db);
		n += 1;
	}
	return n ? sum / n : 0;
}
var WIDTH = 160;
var HEIGHT = 284;
var COUNT = 6;
async function prepareClip(input, output) {
	const dir = await mkdtemp(join(tmpdir(), "naseem-frames-"));
	const grayPath = join(dir, "frames.gray");
	try {
		const duration = await probeDuration(input);
		if (!Number.isFinite(duration) || duration < 1.2) return {
			ok: false,
			reason: "الفيديو قصير جداً أو ما انقرأ"
		};
		if (duration > 45) return {
			ok: false,
			reason: "الشورت لازم يكون أقل من ٤٥ ثانية"
		};
		const base = [
			"-y",
			"-i",
			input,
			"-filter_complex",
			`[0:v]fps=${(COUNT / duration).toFixed(5)},scale=${WIDTH}:${HEIGHT}:flags=fast_bilinear,format=gray[g];[0:v]scale=720:-2,format=yuv420p[v]`,
			"-map",
			"[g]",
			"-frames:v",
			String(COUNT),
			"-f",
			"rawvideo",
			grayPath,
			"-map",
			"[v]"
		];
		const video = [
			"-c:v",
			"libx264",
			"-preset",
			"ultrafast",
			"-crf",
			"30",
			"-pix_fmt",
			"yuv420p",
			"-movflags",
			"+faststart",
			output
		];
		try {
			await ffmpeg([
				...base,
				"-map",
				"0:a?",
				...video.slice(0, -1),
				"-c:a",
				"aac",
				"-b:a",
				"96k",
				output
			], 18e4);
		} catch (error) {
			console.error("[naseem] rain audio pass", error);
			await ffmpeg([
				...base,
				"-an",
				...video
			], 18e4);
		}
		const gray = new Uint8Array(await readFile(grayPath));
		const frame = WIDTH * HEIGHT;
		if (gray.length < frame * 3) return {
			ok: false,
			reason: "تعذر قراءة فيديو MOV"
		};
		const packed = new Uint8Array(frame * COUNT);
		const got = Math.min(COUNT, Math.floor(gray.length / frame));
		packed.set(gray.subarray(0, got * frame));
		for (let index = got; index < COUNT; index += 1) packed.set(packed.subarray((got - 1) * frame, got * frame), index * frame);
		return classifyGray(packed, WIDTH, HEIGHT, COUNT);
	} catch (error) {
		console.error("[naseem] rain prepare", error);
		return {
			ok: false,
			reason: "تعذر قراءة الفيديو. أعد المحاولة، والصيغة MOV أو MP4 من كاميرا الآيفون."
		};
	} finally {
		await rm(dir, {
			recursive: true,
			force: true
		});
	}
}
function probeDuration(input) {
	return new Promise((resolve, reject) => {
		const child = spawn("ffmpeg", [
			"-hide_banner",
			"-i",
			input
		], { stdio: [
			"ignore",
			"ignore",
			"pipe"
		] });
		let text = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(/* @__PURE__ */ new Error("probe"));
		}, 2e4);
		child.stderr.on("data", (chunk) => {
			text += chunk.toString();
			if (text.length > 2e4) text = text.slice(-2e4);
		});
		child.on("error", (error) => {
			clearTimeout(timer);
			reject(error);
		});
		child.on("close", () => {
			clearTimeout(timer);
			const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
			if (!match) reject(/* @__PURE__ */ new Error("duration"));
			else resolve(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
		});
	});
}
function ffmpeg(args, timeoutMs = 6e4) {
	return new Promise((resolve, reject) => {
		const child = spawn("ffmpeg", [
			"-hide_banner",
			"-loglevel",
			"error",
			...args
		], { stdio: [
			"ignore",
			"ignore",
			"pipe"
		] });
		let err = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(/* @__PURE__ */ new Error("ffmpeg timeout"));
		}, timeoutMs);
		child.stderr.on("data", (chunk) => {
			err += chunk.toString();
			if (err.length > 4e3) err = err.slice(-4e3);
		});
		child.on("error", (error) => {
			clearTimeout(timer);
			reject(error);
		});
		child.on("close", (code) => {
			clearTimeout(timer);
			if (code === 0) resolve();
			else reject(new Error(err.trim() || "ffmpeg"));
		});
	});
}
var REGISTRY = join(tmpdir(), "naseem-rain-registry.json");
var CHUNK_MAX = 1048576;
function asClip(row) {
	const level = isRainLevel(row.intensity) ? row.intensity : "moderate";
	const region = SA_REGIONS.find((item) => item.id === row.region_id)?.name ?? "";
	const at = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? (/* @__PURE__ */ new Date()).toISOString());
	return {
		id: row.id,
		regionId: row.region_id,
		place: row.place,
		level,
		src: `/api/rain-clips?id=${encodeURIComponent(row.id)}`,
		caption: describeRain(level, row.place, region),
		at
	};
}
async function listRows() {
	return (await getSql())`select id, region_id, place, intensity, created_at from rain_clips order by created_at desc limit 80`;
}
function noStore(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}
var Route$2 = createFileRoute("/api/rain-clips")({ server: { handlers: {
	GET: async ({ request }) => {
		const id = new URL(request.url).searchParams.get("id");
		try {
			if (id) {
				const row = (await (await getSql())`select mime, bytes from rain_clips where id = ${id} limit 1`)[0];
				if (!row?.bytes) return new Response("missing", { status: 404 });
				const raw = row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes);
				const copy = new Uint8Array(raw.byteLength);
				copy.set(raw);
				return new Response(new Blob([copy], { type: row.mime || "video/mp4" }), { headers: {
					"content-type": row.mime || "video/mp4",
					"cache-control": "public, max-age=86400"
				} });
			}
			const rows = await listRows();
			return noStore({ clips: [...SEED_CLIPS, ...rows.map(asClip)] });
		} catch (error) {
			console.error("[naseem] rain list", error);
			return noStore({ clips: SEED_CLIPS });
		}
	},
	POST: async ({ request }) => {
		try {
			const url = new URL(request.url);
			const type = request.headers.get("content-type") ?? "";
			if (url.searchParams.get("phase") === "chunk" || type.includes("application/octet-stream")) {
				const offset = Number(url.searchParams.get("offset") ?? "0");
				return await saveChunk(url.searchParams.get("id") ?? "", offset, new Uint8Array(await request.arrayBuffer()));
			}
			const body = await request.json();
			const phase = String(body.phase ?? "");
			if (phase === "start") return await startUpload(body);
			if (phase === "finish") return await finishUpload(body);
			return noStore({ error: "طلب غير مفهوم" }, 400);
		} catch (error) {
			console.error("[naseem] rain upload", error);
			return noStore({ error: "تعذر حفظ الفيديو" }, 500);
		}
	}
} } });
function lock(task) {
	const g = globalThis;
	const run = (g.__naseemUpLock ?? Promise.resolve()).catch(() => void 0).then(task);
	g.__naseemUpLock = run.then(() => void 0, () => void 0);
	return run;
}
async function readRegistry() {
	try {
		return JSON.parse(await readFile(REGISTRY, "utf8"));
	} catch {
		return {};
	}
}
async function writeRegistry(all) {
	await writeFile(REGISTRY, JSON.stringify(all));
}
async function startUpload(body) {
	const regionId = String(body.regionId ?? "");
	const place = String(body.place ?? "").trim().slice(0, 40);
	const name = String(body.name ?? "clip.mov").slice(0, 120);
	const size = Number(body.size);
	if (!SA_REGIONS.some((item) => item.id === regionId)) return noStore({ error: "اختر المنطقة" }, 400);
	if (place.length < 2) return noStore({ error: "اكتب اسم المكان" }, 400);
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	if (![
		"mov",
		"mp4",
		"m4v",
		"webm",
		"qt"
	].includes(ext)) return noStore({ error: "الصيغة لازم MOV أو MP4" }, 400);
	if (!Number.isFinite(size) || size < 1 || size > 251658240) return noStore({ error: "حجم الفيديو غير مقبول" }, 400);
	return lock(async () => {
		const all = await readRegistry();
		if (Object.keys(all).length > 12) return noStore({ error: "الرفع مشغول. حاول بعد لحظات." }, 429);
		const dir = await mkdtemp(join(tmpdir(), "naseem-up-"));
		const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
		const path = join(dir, "in.mov");
		await writeFile(path, Buffer.alloc(0));
		all[id] = {
			path,
			dir,
			regionId,
			place,
			name,
			size,
			received: 0
		};
		await writeRegistry(all);
		return noStore({ id });
	});
}
async function saveChunk(id, offset, bytes) {
	if (!/^u[a-z0-9]+$/.test(id)) return noStore({ error: "جلسة الرفع غير صالحة" }, 400);
	if (!Number.isInteger(offset) || offset < 0 || bytes.byteLength < 1 || bytes.byteLength > CHUNK_MAX) return noStore({ error: "جزء الرفع غير صالح" }, 400);
	return lock(async () => {
		const all = await readRegistry();
		const upload = all[id];
		if (!upload) return noStore({ error: "انتهت جلسة الرفع. أعد المحاولة." }, 400);
		if (offset > upload.received || offset + bytes.byteLength > upload.size) return noStore({ error: "ترتيب الرفع اختل. أعد المحاولة." }, 409);
		const handle = await open(upload.path, "r+");
		try {
			await handle.write(bytes, 0, bytes.byteLength, offset);
		} finally {
			await handle.close();
		}
		const end = offset + bytes.byteLength;
		if (end > upload.received) upload.received = end;
		all[id] = upload;
		await writeRegistry(all);
		return noStore({ received: upload.received });
	});
}
async function finishUpload(body) {
	const id = String(body.id ?? "");
	if (!/^u[a-z0-9]+$/.test(id)) return noStore({ error: "جلسة الرفع غير صالحة" }, 400);
	const upload = await lock(async () => {
		const all = await readRegistry();
		const found = all[id];
		if (!found) return null;
		delete all[id];
		await writeRegistry(all);
		return found;
	});
	if (!upload) return noStore({ error: "انتهت جلسة الرفع. أعد المحاولة." }, 400);
	try {
		if (upload.received !== upload.size) return noStore({ error: "الملف وصل ناقص. أعد الرفع." }, 400);
		const play = join(upload.dir, "play.mp4");
		const verdict = await prepareClip(upload.path, play);
		if (!verdict.ok) return noStore({ error: verdict.reason }, 422);
		const bytes = await readFile(play);
		const sql = await getSql();
		const clipId = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
		const rows = await sql`insert into rain_clips (id, region_id, place, intensity, mime, bytes) values (${clipId}, ${upload.regionId}, ${upload.place}, ${verdict.level}, ${"video/mp4"}, ${bytes}) returning created_at`;
		await sql`delete from rain_clips where id in (select id from rain_clips order by created_at desc offset 80)`;
		const atRaw = rows[0]?.created_at;
		const at = atRaw instanceof Date ? atRaw.toISOString() : String(atRaw ?? (/* @__PURE__ */ new Date()).toISOString());
		const region = SA_REGIONS.find((item) => item.id === upload.regionId)?.name ?? "";
		return noStore({ clip: {
			id: clipId,
			regionId: upload.regionId,
			place: upload.place,
			level: verdict.level,
			src: `/api/rain-clips?id=${encodeURIComponent(clipId)}`,
			caption: describeRain(verdict.level, upload.place, region),
			at
		} });
	} finally {
		await rm(upload.dir, {
			recursive: true,
			force: true
		});
	}
}
var Route$1 = createFileRoute("/api/region-alerts")({ server: { handlers: { GET: async () => {
	try {
		return jsonResponse(await regionAlertLevels());
	} catch (error) {
		console.error("[naseem] region alerts", error);
		return jsonResponse({ error: "alerts failed" }, 502);
	}
} } } });
var Route = createFileRoute("/api/reverse")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const lat = readCoord(url.searchParams.get("lat"), -80, 80);
	const lon = readCoord(url.searchParams.get("lon"), -180, 180);
	if (lat == null || lon == null) return jsonResponse({ error: "bad coords" }, 400);
	return jsonResponse({ place: await reversePlace(lat, lon) });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	ApiFieldRoute: Route$6.update({
		id: "/api/field",
		path: "/api/field",
		getParentRoute: () => Route$8
	}),
	ApiForecastRoute: Route$5.update({
		id: "/api/forecast",
		path: "/api/forecast",
		getParentRoute: () => Route$8
	}),
	ApiGeocodeRoute: Route$4.update({
		id: "/api/geocode",
		path: "/api/geocode",
		getParentRoute: () => Route$8
	}),
	ApiRadarRoute: Route$3.update({
		id: "/api/radar",
		path: "/api/radar",
		getParentRoute: () => Route$8
	}),
	ApiRainClipsRoute: Route$2.update({
		id: "/api/rain-clips",
		path: "/api/rain-clips",
		getParentRoute: () => Route$8
	}),
	ApiRegionAlertsRoute: Route$1.update({
		id: "/api/region-alerts",
		path: "/api/region-alerts",
		getParentRoute: () => Route$8
	}),
	ApiReverseRoute: Route.update({
		id: "/api/reverse",
		path: "/api/reverse",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { describeRain as a, SEED_CLIPS as i, RAIN_LABEL as n, formatClipStamp as o, Route$7 as s, router_exports as t };
