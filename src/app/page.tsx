"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WEDDING_DATE = new Date("Jul 5, 2026 17:00:00").getTime();

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function Home() {
    const [envelopeOpen, setEnvelopeOpen] = useState(false);
    const [screenFading, setScreenFading] = useState(false);
    const [showMain, setShowMain] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [rsvpStatus, setRsvpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    /* countdown */
    useEffect(() => {
        const tick = () => {
            const dist = WEDDING_DATE - Date.now();
            if (dist <= 0) { setCd({ d: 0, h: 0, m: 0, s: 0 }); return; }
            setCd({
                d: Math.floor(dist / 86400000),
                h: Math.floor((dist % 86400000) / 3600000),
                m: Math.floor((dist % 3600000) / 60000),
                s: Math.floor((dist % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    /* scroll reveal */
    useEffect(() => {
        if (!showMain) return;
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [showMain]);

    /* floating hearts */
    useEffect(() => {
        if (!showMain) return;
        const spawn = () => {
            const el = document.createElement("span");
            el.className = "floating-heart";
            el.textContent = "♥";
            el.style.left = `${Math.random() * 100}%`;
            el.style.fontSize = `${Math.random() * 12 + 8}px`;
            el.style.animationDuration = `${Math.random() * 5 + 7}s`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 13000);
        };
        const id = setInterval(spawn, 1400);
        return () => clearInterval(id);
    }, [showMain]);

    const openEnvelope = useCallback(() => {
        if (envelopeOpen) return;
        setEnvelopeOpen(true);
        setTimeout(() => {
            setScreenFading(true);
            setTimeout(() => {
                setShowMain(true);
                audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
            }, 800);
        }, 2000);
    }, [envelopeOpen]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    };

    const handleRSVP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRsvpStatus("loading");
        const data = Object.fromEntries(new FormData(e.currentTarget).entries());
        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            setRsvpStatus(res.ok ? "success" : "error");
        } catch {
            setRsvpStatus("error");
        }
    };

    return (
        <>
            <audio ref={audioRef} loop src="/nhac1.mp3?v=2" preload="none" suppressHydrationWarning />

            {/* ─── ENVELOPE SCREEN ─── */}
            {!showMain && (
                <div id="envelope-screen" className={screenFading ? "fade-out" : ""}>
                    <div
                        className={`envelope-wrapper${envelopeOpen ? " open" : ""}`}
                        onClick={openEnvelope}
                        role="button"
                        aria-label="Mở thiệp cưới"
                    >
                        {/* Shadow */}
                        <div className="env-shadow" />

                        {/* Letter card — z-index:1, HIDDEN behind env-body */}
                        <div className="env-letter">
                            <span className="env-letter-heart">♥</span>
                            <div className="env-letter-name">
                                Hùng Anh<br />&amp;<br />Kiều Trinh
                            </div>
                        </div>

                        {/* Envelope body — z-index:2, COVERS the letter */}
                        <div className="env-body">
                            <div className="env-pocket" />
                        </div>

                        {/* Flap — z-index:5, above body */}
                        <div className="env-flap" />

                        {/* Wax seal — z-index:6 */}
                        <div className="env-seal">❤</div>

                        {/* Flying hearts */}
                        <div className="env-hearts">
                            <div className="env-heart h1" />
                            <div className="env-heart h2" />
                            <div className="env-heart h3" />
                        </div>

                        {/* Tap hint */}
                        {!envelopeOpen && (
                            <div className="tap-hint">Chạm để mở thiệp</div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── MAIN CONTENT ─── */}
            {showMain && (
                <div id="main-content">
                    {/* Audio button */}
                    <button
                        id="audio-btn"
                        className={isPlaying ? "spinning" : ""}
                        onClick={toggleAudio}
                        aria-label="Toggle music"
                    >
                        <svg className="audio-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                        </svg>
                    </button>

                    <div className="page-wrap">

                        {/* ── COVER ── */}
                        <section className="section-cover">
                            <div className="cover-bg" style={{ backgroundImage: "url('/assets/hero.jpg')" }} />
                            <div className="cover-overlay" />
                            <div className="cover-content">
                                <p className="cover-invite">Trân trọng kính mời</p>
                                <h1 className="cover-names">
                                    Hùng Anh <span className="cover-amp">&amp;</span> Kiều Trinh
                                </h1>
                                <p className="cover-date">Chủ Nhật · 05 · 07 · 2026</p>
                                <span className="cover-scroll">↓ cuộn xuống ↓</span>
                            </div>
                        </section>

                        {/* ── INTRO ── */}
                        <section className="section-intro section-pad reveal">
                            <div className="content-inner">
                                <div className="divider-row">
                                    <div className="divider-line" />
                                    <span className="divider-heart">♥</span>
                                    <div className="divider-line r" />
                                </div>
                                <p className="section-label">our story</p>
                                <h2 className="section-title">Lời Ngỏ</h2>
                                <p className="intro-text">
                                    Với tất cả tình yêu thương và sự trân trọng,<br />
                                    chúng tôi xin trân trọng kính mời bạn<br />
                                    đến chung vui trong ngày hạnh phúc nhất<br />
                                    của cuộc đời chúng tôi.<br /><br />
                                    Sự hiện diện của bạn là món quà quý giá nhất<br />
                                    mà chúng tôi nhận được trong ngày đặc biệt này.
                                </p>
                                <div className="intro-big-names">Hùng Anh &amp; Kiều Trinh</div>
                            </div>
                        </section>

                        {/* ── EVENTS ── */}
                        <section className="section-events section-pad reveal">
                            <p className="section-label">wedding details</p>
                            <h2 className="section-title">Thông Tin Tiệc Cưới</h2>
                            <div className="events-grid" style={{ justifyContent: "center" }}>
                                <div className="event-card reveal" style={{ maxWidth: 420, margin: "0 auto" }}>
                                    <div className="event-icon">🥂</div>
                                    <div className="event-tag">Trân Trọng Kính Mời</div>
                                    <div className="event-name">Tiệc Cưới</div>
                                    <div className="event-divider" />
                                    <div className="event-date">Chủ Nhật · 05 / 07 / 2026<br />Vào lúc 17H00</div>
                                    <div className="event-venue">
                                        <strong>Vàng Son Restaurant</strong><br />
                                        Sảnh Vàng Son 2<br />
                                        548 Phạm Văn Đồng, Phường Thống Nhất<br />
                                        Tỉnh Gia Lai
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── COUNTDOWN ── */}
                        <section className="section-countdown section-pad reveal">
                            <p className="section-label">countdown</p>
                            <h2 className="section-title">Cùng Đếm Ngược</h2>
                            <div className="countdown-boxes">
                                {([["d", "Ngày"], ["h", "Giờ"], ["m", "Phút"], ["s", "Giây"]] as [keyof typeof cd, string][]).map(([k, lbl]) => (
                                    <div className="cd-box" key={k}>
                                        <span className="cd-num">{pad(cd[k])}</span>
                                        <span className="cd-lbl">{lbl}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── GALLERY ── */}
                        <section className="section-pad reveal" style={{ background: "#fff" }}>
                            <p className="section-label">our moments</p>
                            <h2 className="section-title">Khoảnh Khắc</h2>
                            <div className="gallery-grid">
                                {/* Hero — full width top banner */}
                                <div className="g-item g-hero reveal"
                                    style={{ backgroundImage: "url('/assets/hero.jpg')" }} />

                                {/* Left tall portrait */}
                                <div className="g-item g-1 reveal"
                                    style={{ backgroundImage: "url('/assets/gallery_1.jpg')" }} />

                                {/* Right top */}
                                <div className="g-item g-2 reveal"
                                    style={{ backgroundImage: "url('/assets/gallery_2.jpg')" }} />

                                {/* Right bottom */}
                                <div className="g-item g-3 reveal"
                                    style={{ backgroundImage: "url('/assets/gallery_3.jpg')" }} />

                                {/* Full width bottom banner */}
                                <div className="g-item g-4 reveal"
                                    style={{ backgroundImage: "url('/assets/gallery_4.jpg')" }} />
                            </div>
                        </section>

                        {/* ── RSVP ── */}
                        <section className="section-rsvp section-pad reveal">
                            <p className="section-label">rsvp</p>
                            <h2 className="section-title">Xác Nhận Tham Dự</h2>
                            <div className="rsvp-form-box">
                                {rsvpStatus === "success" ? (
                                    <div className="rsvp-success-msg">
                                        ♥ Cảm ơn bạn đã xác nhận!<br />
                                        <span style={{ fontSize: "0.9rem", fontFamily: "Montserrat", fontStyle: "normal", color: "#9a8a75" }}>
                                            Chúng tôi rất mong được gặp bạn!
                                        </span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRSVP}>
                                        {rsvpStatus === "error" && (
                                            <div style={{ color: "#d9534f", marginBottom: "1rem", fontSize: "0.9rem", fontFamily: "var(--font-sans, sans-serif)", textAlign: "center" }}>
                                                ❌ Có lỗi xảy ra khi lưu. Vui lòng thử lại sau!
                                            </div>
                                        )}
                                        <div className="fg">
                                            <input name="name" placeholder="Họ và tên *" required />
                                        </div>
                                        <div className="fg">
                                            <select name="attendance" required defaultValue="">
                                                <option value="" disabled>Bạn có tham dự không? *</option>
                                                <option value="yes">✓ Tôi sẽ tham dự</option>
                                                <option value="no">✗ Rất tiếc, tôi bận</option>
                                            </select>
                                        </div>
                                        <div className="fg">
                                            <input name="guests" type="number" min="0" defaultValue="0" placeholder="Số người đi cùng" />
                                        </div>
                                        <div className="fg">
                                            <textarea name="message" rows={3} placeholder="Lời chúc tới đôi uyên ương..." />
                                        </div>
                                        <button className="btn-rsvp" type="submit" disabled={rsvpStatus === "loading"}>
                                            {rsvpStatus === "loading" ? "Đang gửi..." : "Gửi Xác Nhận ♥"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </section>

                        {/* ── FOOTER ── */}
                        <footer className="site-footer">
                            <div className="footer-names">Hùng Anh &amp; Kiều Trinh</div>
                            <p className="footer-dates">05 · 07 · 2026 &nbsp;</p>
                            <p className="footer-msg">Trân trọng cảm ơn sự hiện diện của bạn ♥</p>
                        </footer>

                    </div>
                </div>
            )}
        </>
    );
}
