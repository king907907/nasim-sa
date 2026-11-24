import { ArrowRight, Download, Share } from "lucide-react";

export type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function deviceKind(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const touch = navigator.maxTouchPoints || 0;
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function InstallSheet({
  open,
  installed,
  prompt,
  onClose,
  onInstalled,
}: {
  open: boolean;
  installed: boolean;
  prompt: InstallPrompt | null;
  onClose: () => void;
  onInstalled: () => void;
}) {
  if (!open) return null;
  const kind = deviceKind();
  const steps =
    kind === "ios"
      ? [
          "افتح نَسيم في سفاري. إذا كان مفتوحاً داخل تطبيق آخر، اضغط مشاركة ثم «فتح في سفاري».",
          "اضغط زر المشاركة أسفل الشاشة: المربع الذي يخرج منه سهم.",
          "مرّر في القائمة واختر «إضافة إلى الشاشة الرئيسية».",
          "تأكد أن الاسم نَسيم والأيقونة البوصلة، ثم اضغط «إضافة».",
        ]
      : kind === "android"
        ? [
            "افتح نَسيم في متصفح كروم.",
            "اضغط قائمة المتصفح، النقاط الثلاث أعلى الشاشة.",
            "اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».",
            "أكد التثبيت. تظهر أيقونة نَسيم مع التطبيقات.",
          ]
        : [
            "على الجوال، أرسل الرابط إلى سفاري أو كروم واتبِع خطوات الشاشة الرئيسية.",
            "على الكمبيوتر في كروم أو إيدج، اضغط أيقونة التثبيت في شريط العنوان.",
            "أو من قائمة المتصفح اختر «تثبيت نَسيم».",
            "بعد التثبيت يفتح كتطبيق مستقل، بدون شريط المتصفح.",
          ];

  return (
    <div className="search-sheet" role="dialog" aria-label="تثبيت نَسيم">
      <div className="search-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <div className="regions-title">
          <strong>تثبيت نَسيم</strong>
          <small>{installed ? "موجود على شاشتك" : "يبقى قريباً مثل التطبيق"}</small>
        </div>
      </div>
      <div className="search-body">
        {installed ? (
          <div className="calm">
            <Download size={28} />
            <strong>نَسيم مثبّت</strong>
            <p>افتحه من أيقونة البوصلة على الشاشة الرئيسية. يعمل بدون شريط المتصفح.</p>
          </div>
        ) : (
          <>
            <p className="install-lead">
              {kind === "ios"
                ? "على الآيفون التثبيت يتم من سفاري. ثلاث ضغطات ويصير أيقونة على الشاشة."
                : kind === "android"
                  ? "على الأندرويد يمكن تثبيته من كروم مباشرة."
                  : "التثبيت أوضح من جوالك. من الكمبيوتر استخدم زر المتصفح."}
            </p>
            {prompt && (
              <button
                type="button"
                className="install-now"
                onClick={() => {
                  void prompt.prompt().then(async () => {
                    const choice = await prompt.userChoice;
                    if (choice.outcome === "accepted") onInstalled();
                  });
                }}
              >
                <Download size={18} />
                تثبيت الآن
              </button>
            )}
            <ol className="install-steps">
              {steps.map((step, index) => (
                <li key={step}>
                  <span className="install-num">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {kind === "ios" && (
              <p className="install-hint">
                <Share size={16} />
                زر المشاركة في سفاري أسفل المنتصف، وليس زر المشاركة داخل التطبيقات الأخرى.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
