import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ClipboardCheck, Loader2, MessageSquare, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { runWorkplaceTranslator } from '../lib/glm';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const personaMap = {
    boss: '暴躁老板',
    colleague: '甩锅同事',
    client: '刁钻甲方',
};

const fallbackState = {
    inputText: '',
    persona: 'boss',
    fireLevel: 2,
    imageDataUrl: null,
};

const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
        <React.Fragment key={`${line}-${index}`}>
            {index > 0 && <br />}
            {line}
        </React.Fragment>
    ));
};

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { inputText, persona, fireLevel, imageDataUrl } = location.state || fallbackState;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState({ subtext: '', response: '', actions: [] });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const payload = await runWorkplaceTranslator({
                    inputText,
                    fireLevel,
                    persona,
                    imageDataUrl,
                });

                if (!ignore) {
                    setResult(payload);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Translation failed.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            ignore = true;
        };
    }, [inputText, persona, fireLevel, imageDataUrl]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(result.response || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="relative flex h-[100dvh] w-full max-w-md flex-col items-center justify-center overflow-hidden bg-zinc-950 font-display antialiased mx-auto">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-8 rounded-full bg-purple-500/20 blur-3xl"
                        />
                        <Loader2 className="relative z-10 h-16 w-16 animate-spin text-purple-400" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-lg font-black uppercase tracking-[0.18em] text-white">Decoding</h3>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">GLM is analyzing context</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex h-[100dvh] w-full max-w-md flex-col items-center justify-center overflow-hidden bg-zinc-950 p-8 text-center font-display antialiased mx-auto">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">解析失败</h3>
                    <p className="max-w-[280px] text-sm leading-relaxed text-zinc-500">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 rounded-xl bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
                    >
                        返回主页
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-100 shadow-2xl sm:border-x sm:border-white/5"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
            </div>

            <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-end justify-center border-b border-white/[0.03] bg-zinc-950/90 px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute bottom-2 left-4 flex size-9 items-center justify-center rounded-full bg-white/[0.03] text-zinc-300 transition-all hover:bg-white/[0.08]"
                    aria-label="返回"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="flex items-center gap-2 text-[17px] font-black tracking-tight text-zinc-100">
                    <span className="font-mono text-xl text-purple-500">&gt;</span>
                    报告解析
                </h2>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto p-4 pb-36 pt-4 no-scrollbar">
                <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between px-1 py-1">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-purple-500" />
                        <span className="text-xs font-tech uppercase tracking-widest text-zinc-500">
                            Target: {personaMap[persona] || personaMap.boss}
                        </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-700">LV.{fireLevel} READY</div>
                </motion.div>

                <motion.section variants={itemVariants} className="mb-5">
                    <div className="rounded-[24px] border-b-4 border-amber-600/30 bg-accent-amber p-6 shadow-2xl">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] font-bold text-zinc-950">visibility</span>
                            <span className="text-base font-black tracking-tight text-zinc-950">潜台词</span>
                        </div>
                        <div className="text-[16.5px] font-bold leading-[1.8] tracking-tight text-zinc-900">
                            {renderText(result.subtext)}
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="mb-5">
                    <div className="mb-3 flex items-center gap-2 px-1 text-zinc-300">
                        <ClipboardCheck className="h-4 w-4" />
                        <h3 className="text-[15px] font-black">下一步行动</h3>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {result.actions.map((action, index) => (
                            <div
                                key={`${action}-${index}`}
                                className="flex items-start gap-4 rounded-2xl border border-white/[0.03] bg-zinc-900/30 p-4"
                            >
                                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-green-500/20 bg-green-500/10 text-green-500">
                                    <Check className="h-3 w-3" />
                                </div>
                                <p className="flex-1 text-[14px] font-bold leading-relaxed tracking-tight text-zinc-300">
                                    {action}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.section variants={itemVariants}>
                    <div className="mb-3 flex items-center gap-2 px-1 text-zinc-300">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        <h3 className="text-[15px] font-black">建议回复</h3>
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-white/[0.05] bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-5 py-2.5">
                            <div className="flex items-center gap-2 py-0.5">
                                <div className="size-1.5 rounded-full bg-purple-500" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">READY</span>
                            </div>
                        </div>
                        <div className="min-h-[140px] p-7">
                            <div className="font-serif text-[18px] italic leading-[1.8] tracking-wide text-terminal-green">
                                "{result.response}"
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>

            <motion.div
                variants={itemVariants}
                className="absolute bottom-0 left-0 z-40 w-full bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8"
            >
                <div className="relative">
                    <div
                        className={cn(
                            'absolute -inset-[2px] rounded-2xl blur-2xl transition-all duration-700',
                            copied ? 'bg-green-500/40' : 'bg-purple-600/25'
                        )}
                    />
                    <button
                        onClick={handleCopy}
                        disabled={!result.response}
                        className={cn(
                            'relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl transition-all',
                            copied ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-blue-600',
                            !result.response && 'cursor-not-allowed opacity-60'
                        )}
                    >
                        <span className="material-symbols-outlined text-[24px]">{copied ? 'done' : 'content_copy'}</span>
                        <span>{copied ? '已复制' : '复制内容'}</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Result;
