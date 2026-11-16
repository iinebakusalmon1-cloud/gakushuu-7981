import { createRoot } from "react-dom/client";

function PortalFrame({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      title="学習支援ポータルサイト"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
      allow="fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer"
      style={{ position: "fixed", inset: 0, display: "block", width: "100vw", height: "100dvh", maxWidth: "100%", border: 0, background: "#fff" }}
    />
  );
}

export function openPortalWindow(url: string) {
  if (url !== "https://alli-tube.runable.site/") return false;
  const tab = window.open("about:blank", "_blank");
  if (!tab) return false;
  tab.opener = null;
  tab.document.title = "学習支援ポータルサイト";
  tab.document.documentElement.lang = "ja";
  const viewport = tab.document.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  tab.document.head.appendChild(viewport);
  tab.document.documentElement.style.width = "100%";
  tab.document.documentElement.style.height = "100%";
  tab.document.documentElement.style.overflow = "hidden";
  tab.document.body.style.margin = "0";
  tab.document.body.style.width = "100%";
  tab.document.body.style.height = "100dvh";
  tab.document.body.style.overflow = "hidden";
  createRoot(tab.document.body).render(<PortalFrame url={url} />);
  return true;
}