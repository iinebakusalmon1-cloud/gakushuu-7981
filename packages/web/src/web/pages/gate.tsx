import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, ArrowRight, Eye, EyeOff, LockKeyhole, LoaderCircle, Check, ExternalLink } from "lucide-react";
import { useGateSession, useVerifyGate } from "../queries/gate";
import { openPortalWindow } from "../components/portal-window";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [verifiedUrl, setVerifiedUrl] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const verify = useVerifyGate();
  const session = useGateSession();
  const successUrl = verifiedUrl ?? (session.data?.authenticated ? session.data.url : null);
  useEffect(() => {
    document.title = "学習支援ポータルサイト";
    document.documentElement.lang = "ja";
  }, []);
  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setRetrySeconds(retrySeconds - 1);
      if (retrySeconds === 1) setError("");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (verify.isPending || retrySeconds > 0) return;
    setError("");
    try {
      const result = await verify.mutateAsync({ password });
      if (!result.valid || !result.url) {
        if (result.retryAfterSeconds > 0) {
          setRetrySeconds(result.retryAfterSeconds);
          setError("試行回数の上限に達しました。少し待って、もう一度お試しください。");
        } else {
          setError("パスワードが違います。もう一度入力してください。");
        }
        return;
      }
      setVerifiedUrl(result.url);
      setPassword("");
      setBlocked(!openPortalWindow(result.url));
    } catch {
      setError("接続できませんでした。少し待って、もう一度お試しください。");
    }
  }

  return (
    <div className="gate-shell">
      <header className="site-header">
        <div className="brand"><img className="classroom-logo" src="/images/classroom-logo.png" alt="Classroom" width={38} height={38} /><span>学習支援ポータルサイト</span></div>
        <span className="header-label"><span className="status-dot" /> ACCESS GATE</span>
      </header>
      <main className="gate-main">
        <div className="intro"><span className="eyebrow">LEARNING SUPPORT PORTAL</span><h1>その先へ、<br />ログインして進もう。</h1><p>パスワードを入力して、学習支援ポータルサイトへ。</p></div>
        <section className="login-card" aria-labelledby="login-title">
          <div className="card-heading"><div className="lock-icon"><LockKeyhole size={20} strokeWidth={1.7} /></div><div><h2 id="login-title">{successUrl ? "認証が完了しました" : "ログイン"}</h2><p>{successUrl ? "学習支援ポータルサイトへ進む準備ができました。" : "パスワードでアクセス"}</p></div><span className="step-label">01 / 01</span></div>
          {session.isPending && !verifiedUrl ? <div className="session-loading" aria-live="polite"><LoaderCircle className="spinner" size={20} />認証状態を確認中</div> : successUrl ? <div className="success-panel" aria-live="polite"><div className="success-check"><Check size={26} /></div><h3>アクセスが許可されました</h3><p>{blocked ? "新しいタブがブロックされました。下のボタンから開いてください。" : !verifiedUrl ? "認証済みです。下のボタンから学習支援ポータルサイトを開けます。" : "学習支援ポータルサイトを新しいタブで開きました。"}</p><button className="primary-button" type="button" onClick={() => setBlocked(!openPortalWindow(successUrl))}>学習支援ポータルサイトを開く<ExternalLink size={17} /></button></div> : <form onSubmit={submit}>
            {session.isError && <p className="session-error" role="alert">認証状態を確認できませんでした。<button type="button" onClick={() => void session.refetch()}>再試行</button></p>}
            <label htmlFor="password">6桁の認証コード</label>
            <div className={`password-field ${error ? "has-error" : ""}`}><LockKeyhole size={17} /><input id="password" aria-label="6桁の認証コード" type={visible ? "text" : "password"} value={password} onChange={(event) => {setPassword(event.target.value); if (!retrySeconds) setError("");}} placeholder="認証アプリのコードを入力" autoComplete="one-time-code" inputMode="numeric" maxLength={6} required aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} disabled={verify.isPending || retrySeconds > 0} /><button type="button" className="eye-button" aria-label={visible ? "認証コードを隠す" : "認証コードを表示"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
            {error && <p id="login-error" className="error-message" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={verify.isPending || !/^[0-9]{6}$/.test(password) || retrySeconds > 0}>{verify.isPending ? <>確認中<LoaderCircle size={18} className="spinner" /></> : retrySeconds > 0 ? <>あと{retrySeconds}秒お待ちください</> : <>ログインして学習支援ポータルサイトへ<ArrowUpRight size={20} /></>}</button>
            <p className="new-tab-note"><ExternalLink size={12} />認証後、新しいタブで開きます</p>
          </form>}
        </section>
        <div className="destination"><span className="destination-label">DESTINATION</span><span className="destination-name">学習支援ポータルサイト</span><ArrowRight size={15} /></div>
      </main>
      <footer className="site-footer"><span>学習支援ポータルサイト</span><span>学習支援ポータルサイト</span></footer>
    </div>
  );
}