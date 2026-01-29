import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, ArrowLeft, Terminal, Zap, ChevronRight, Check, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { runDifyWorkflow, getUserId } from '../lib/dify';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { inputText, mode, persona, fireLevel, fileId } = location.state || { inputText: '暂无输入', mode: 'decode', persona: 'boss', fireLevel: 2, fileId: null };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [difyResult, setDifyResult] = useState({ subtext: '', response: '', actions: [] });
    const [copied, setCopied] = useState(false);

    // 映射身份名称
    const personaMap = {
        boss: '暴躁老板',
        colleague: '甩锅同事',
        client: '刁钻甲方'
    };

    /**
     * 将简单的 Markdown (主要是加粗) 转换为 HTML
     */
    const renderMarkdown = (text) => {
        if (!text) return { __html: '' };
        // 替换 **文本** 为 <strong>文本</strong>，恢复为深色文字以适配深色琥珀色卡片
        const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-zinc-950 underline decoration-amber-500/30">$1</strong>');
        // 处理换行
        return { __html: formatted.replace(/\n/g, '<br/>') };
    };

    /**
     * 清理行动建议中的冗余字符
     */
    const cleanAction = (action) => {
        return action
            .replace(/^[✅☑️✔️\-*·]\s*/, '') // 移除开头的各种列表符号
            .replace(/\*/g, '') // 移除所有星号（Markdown 粗体/斜体标记）
            .trim();
    };

    /**
     * 解析 Dify 返回的 Markdown 文本
     * 采用更稳健的关键词切分方式，避免正则对换行符或 Emoji 过于敏感的问题
     */
    const parseDifyMarkdown = (text) => {
        const result = {
            subtext: '',
            actions: [],
            response: ''
        };

        if (!text) return result;

        // 使用 ### 进行初次切分
        const sections = text.split(/###\s+/);

        sections.forEach(section => {
            const cleanSection = section.trim();
            if (cleanSection.includes('潜台词解码')) {
                // 移除标题部分，保留正文
                result.subtext = cleanSection.replace(/.*潜台词解码\s*\n?/, '').trim();
            } else if (cleanSection.includes('行动建议')) {
                const actionsContent = cleanSection.replace(/.*行动建议\s*\n?/, '').trim();
                const lines = actionsContent.split('\n');
                result.actions = lines
                    .map(line => line.replace(/^[-*]\s*|^\d+\.\s*/, '').trim())
                    .filter(line => line.length > 0);
            } else if (cleanSection.includes('建议回复')) {
                result.response = cleanSection.replace(/.*建议回复\s*\n?/, '').trim();
            }
        });

        // 进一步清洗 subtext，防止嵌套的 Markdown 标题干扰
        if (result.subtext) {
            result.subtext = result.subtext.replace(/^#+\s+/gm, '').trim();
        }

        // 兜底处理：如果解析完全失败，则把全文展示在潜台词区，但至少尝试展示 response
        if (!result.subtext && !result.response) {
            result.subtext = text;
        }

        return result;
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const files = fileId ? [{
                    type: 'image',
                    transfer_method: 'local_file',
                    upload_file_id: fileId
                }] : [];

                console.log('Sending to Dify:', {
                    user: getUserId(),
                    inputs: {
                        personaMap: personaMap[persona] || persona,
                        fireLevel: fireLevel.toString(),
                        text: inputText || ' ',
                        files: files // 将文件映射到工作流定义的 files 变量
                    },
                    files: files
                });

                const response = await runDifyWorkflow({
                    personaMap: personaMap[persona] || persona,
                    fireLevel: fireLevel.toString(),
                    text: inputText || ' ', // 确保 text 至少有空格，防止 Dify 报错
                    files: files // 同时在 inputs 中传递，匹配工作流变量
                }, files);

                console.log('Dify raw response:', response);

                const outputs = response.data.outputs;
                // 有些 Dify 配置直接返回 text，有些在 outputs.result 里，这里多层兼容
                const rawText = outputs.text || outputs.result || (typeof outputs === 'string' ? outputs : JSON.stringify(outputs));

                const parsed = parseDifyMarkdown(rawText);
                setDifyResult(parsed);

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [inputText, persona, fireLevel, fileId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(difyResult.response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark font-display antialiased p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                        ></motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Sparkles className="w-6 h-6 text-primary" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold dark:text-white">正在深度解码...</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-500 font-mono italic animate-pulse">正在穿透职场伪装，捕捉真实意图</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark font-display antialiased p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <span className="material-symbols-outlined text-[40px]">error</span>
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">解码失败</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed max-w-[280px]">
                        无法解析这段“鸟语”。<br />可能是网络波动或 API 服务暂不可用。<br />
                        <span className="text-xs opacity-60 font-mono mt-2 block">[{error}]</span>
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                        返回主页
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative flex h-[100dvh] w-full flex-col max-w-md mx-auto border-x border-zinc-900 shadow-2xl bg-zinc-950 text-zinc-100 font-display antialiased overflow-hidden"
        >
            {/* 渐变装饰背景 - 保持与首页一致 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
            </div>
            {/* 顶部导航 - 精简对齐版本 */}
            <header className="flex items-center px-4 py-8 justify-center sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="absolute left-5 text-zinc-400 flex size-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 hover:text-purple-400 transition-all border border-white/5"
                    title="返回"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 font-display">
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-purple-500 text-2xl font-black"
                        >
                            &gt;_
                        </motion.span>
                        <h2 className="text-zinc-100 text-2xl font-bold tracking-normal">深度解码报告</h2>
                    </div>

                    <div className="flex items-center gap-1.5 mt-4 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></span>
                        <p className="text-primary text-[11px] font-bold tracking-[0.25em] uppercase">TARGET: {personaMap[persona] || '未知'}</p>
                    </div>
                </div>

                {/* 右侧留空以保持标题居中 */}
                <div className="absolute right-5 w-10"></div>
            </header>

            <main className="flex-1 flex flex-col gap-6 p-4 pt-6 no-scrollbar relative z-10 overflow-y-auto">
                {/* 顶部防穿透遮罩 - 适配暗色背景 */}
                <div className="sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none -mt-6"></div>

                {/* 潜台词卡片 */}
                <motion.div variants={itemVariants} className="w-full snap-start scroll-mt-24">
                    <div className="flex flex-col gap-3 rounded-2xl bg-accent-amber p-6 shadow-xl relative overflow-hidden group border-b-4 border-amber-600/50">
                        <div className="flex flex-col gap-3 z-10">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex items-center justify-center size-9 rounded-xl bg-black/10 text-zinc-950 border border-black/5 shadow-inner">
                                    <span className="material-symbols-outlined text-[24px]">visibility</span>
                                </div>
                                <p className="text-zinc-950 text-xl font-black leading-tight">
                                    潜台词
                                </p>
                            </div>
                            <div className="relative">
                                <div
                                    className="text-zinc-900 text-[16px] font-serif font-medium leading-[1.8] tracking-normal pb-4"
                                    dangerouslySetInnerHTML={renderMarkdown(difyResult.subtext)}
                                />
                            </div>
                        </div>
                        {/* 装饰性背景 */}
                        <div className="absolute top-[-10%] right-[-5%] opacity-10 pointer-events-none transform rotate-12">
                            <span className="material-symbols-outlined text-[100px] text-black">search_insights</span>
                        </div>
                    </div>
                </motion.div>

                {/* 下一步行动 */}
                <motion.div variants={itemVariants} className="w-full snap-start scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4 px-1">
                        <div className="flex items-center justify-center size-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-zinc-100 tracking-tight text-lg font-display font-black leading-tight">下一步行动</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {difyResult.actions.map((action, index) => {
                            const cleaned = cleanAction(action);
                            if (!cleaned) return null;
                            return (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 transition-all shadow-sm relative overflow-hidden">
                                    <div className="flex-shrink-0 text-green-500 text-[18px] font-mono font-black mt-0.5 min-w-[1.5rem]">
                                        {index + 1}<span className="animate-pulse">_</span>
                                    </div>
                                    <p className="text-zinc-300 text-[15px] font-serif font-bold leading-[1.6] tracking-tight">
                                        {cleaned}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 建议回复 */}
                <motion.div variants={itemVariants} className="w-full snap-start scroll-mt-24">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h3 className="text-zinc-100 tracking-tight text-lg font-display font-black leading-tight">回复话术</h3>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-black/95 overflow-hidden shadow-2xl relative group">
                        <div className="bg-zinc-900/80 px-4 py-3 flex items-center justify-between border-b border-zinc-800/50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase opacity-60">RESPONSE_GEN.sh</span>
                        </div>
                        <div className="p-6 font-serif text-[16px] leading-[1.7] tracking-wider text-terminal-green relative min-h-[160px]">
                            <div
                                className="absolute inset-0 pointer-events-none z-10 opacity-10"
                                style={{
                                    backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
                                    backgroundSize: "20px 20px"
                                }}
                            ></div>
                            <div className="relative z-20 whitespace-pre-wrap">
                                {difyResult.response}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 复制回复大按钮 */}
                <motion.div variants={itemVariants} className="pb-8 pt-4">
                    <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopy}
                        className={cn(
                            "w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white text-lg font-black shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all",
                            copied ? "bg-green-500 hover:bg-green-600 shadow-green-500/30" : "bg-primary hover:bg-blue-600"
                        )}
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {copied ? 'done' : 'content_copy'}
                        </span>
                        {copied ? '已复制到剪贴板' : '复制回复'}
                    </motion.button>
                </motion.div>
                <div className="h-4"></div>
            </main>
        </motion.div>
    );
};

export default Result;
