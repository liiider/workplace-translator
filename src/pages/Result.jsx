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
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center max-w-md mx-auto bg-zinc-950 font-display antialiased overflow-hidden">
                {/* 扫描背景线 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] animate-pulse"></div>

                <div className="relative z-10 flex flex-col items-center gap-10">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-8 bg-purple-500/20 blur-3xl rounded-full"
                        ></motion.div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-b-2 border-t-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        ></motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-display font-black text-white tracking-[0.2em] uppercase">Decoding...</h3>
                            <div className="h-1 w-32 bg-zinc-900 rounded-full mt-2 overflow-hidden relative">
                                <motion.div
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Bypassing Workplace Filters</p>
                            <p className="text-[10px] text-purple-500/50 font-mono tracking-widest uppercase animate-pulse">Injecting Contextual Intel</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center max-w-md mx-auto bg-zinc-950 font-display antialiased p-8 text-center overflow-hidden">
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <span className="material-symbols-outlined text-[40px]">error</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">解码失败</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-[280px]">
                        无法解析这段“鸟语”。<br />可能是网络波动或 API 服务暂不可用。<br />
                        <span className="text-xs opacity-60 font-mono mt-2 block">[{error}]</span>
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-800 text-sm font-semibold hover:bg-zinc-700 transition-colors text-zinc-300"
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
            className="relative flex h-[100dvh] w-full flex-col max-w-md mx-auto sm:border-x border-white/5 shadow-2xl bg-zinc-950 text-zinc-100 font-display antialiased overflow-hidden"
        >
            {/* 渐变装饰背景 - 保持与首页一致 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
                {/* CRT 扫描线背景 */}
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
            </div>
            {/* 顶部导航 - 恢复原有风格但保留适配 */}
            <header className="flex items-end px-4 h-[calc(3.5rem+env(safe-area-inset-top))] pb-3 justify-center sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/[0.03] shrink-0 pt-[env(safe-area-inset-top)]">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="absolute left-4 bottom-2 text-zinc-400 flex size-9 items-center justify-center rounded-full bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-300" />
                </motion.button>

                <div className="flex flex-col items-center">
                    <h2 className="text-zinc-100 text-[17px] font-black tracking-tight flex items-center gap-2">
                        <span className="text-purple-500 font-mono text-xl animate-pulse">&gt;</span>
                        报告解析
                    </h2>
                </div>

                <div className="absolute right-4 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col gap-4 p-4 pt-4 no-scrollbar relative z-10 overflow-y-auto pb-36">
                {/* 顶部防穿透渐变 */}
                <div className="sticky top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-950 via-zinc-950/50 to-transparent z-10 pointer-events-none -mt-6"></div>

                {/* 身份摘要 - 新增 App 风格组件 */}
                <motion.div variants={itemVariants} className="flex items-center justify-between px-1 py-1">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs font-tech text-zinc-500 uppercase tracking-widest">Target: {personaMap[persona]}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-700">LV.{fireLevel} READY</div>
                </motion.div>

                {/* 潜台词卡片 */}
                <motion.div variants={itemVariants} className="w-full">
                    <div className="flex flex-col gap-3 rounded-[24px] bg-accent-amber p-6 shadow-2xl relative overflow-hidden border-b-4 border-amber-600/30">
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-[20px] text-zinc-950 font-bold">visibility</span>
                                <span className="text-zinc-950 text-base font-black tracking-tight">潜台词</span>
                            </div>
                            <div
                                className="text-zinc-900 text-[16.5px] font-serif font-bold leading-[1.8] tracking-tight"
                                dangerouslySetInnerHTML={renderMarkdown(difyResult.subtext)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* 下一步行动 */}
                <motion.div variants={itemVariants} className="w-full">
                    <div className="flex items-center gap-2 mb-3 px-1 text-zinc-300">
                        <ClipboardCheck className="w-4 h-4" />
                        <h3 className="text-[15px] font-black">下一步行动</h3>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {difyResult.actions.map((action, index) => {
                            const cleaned = cleanAction(action);
                            if (!cleaned) return null;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/[0.03] transition-all"
                                >
                                    <div className="flex-shrink-0 size-5 rounded-md bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 mt-0.5">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <p className="text-zinc-300 text-[14px] font-bold leading-relaxed tracking-tight flex-1">
                                        {cleaned}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 建议回复 */}
                <motion.div variants={itemVariants} className="w-full">
                    <div className="flex items-center gap-2 mb-3 px-1 text-zinc-300">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <h3 className="text-[15px] font-black">建议回复</h3>
                    </div>
                    <div className="rounded-[28px] border border-white/[0.05] bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
                        <div className="bg-white/[0.02] px-5 py-2.5 flex items-center justify-between border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 py-0.5">
                                <div className="size-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                                <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">READY</span>
                            </div>
                        </div>
                        <div className="p-7 relative min-h-[140px]">
                            <div className="relative z-20 font-serif text-[18px] leading-[1.8] tracking-wide text-terminal-green italic">
                                “ {difyResult.response} ”
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="h-6"></div>
            </main>

            {/* 一键复制按钮 - 沉浸式固定底部适配 safe-area */}
            <motion.div
                variants={itemVariants}
                className="absolute bottom-0 left-0 w-full px-5 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-40"
            >
                <div className="relative group/btn">
                    <div className={cn(
                        "absolute -inset-[2px] rounded-2xl blur-2xl transition-all duration-700 opacity-20 group-hover/btn:opacity-50",
                        copied ? "bg-green-500" : "bg-purple-600"
                    )}></div>
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCopy}
                        className={cn(
                            "w-full h-15 py-4 relative overflow-hidden rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 border border-white/10",
                            "text-white font-display font-black text-lg shadow-2xl",
                            copied ? "bg-green-600" : "bg-gradient-to-r from-purple-600 to-blue-600"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_3s_infinite]"></div>
                        <span className="material-symbols-outlined text-[24px]">
                            {copied ? 'done' : 'content_copy'}
                        </span>
                        <span className="tracking-widest uppercase text-sm font-black">{copied ? '已复制' : '复制内容'}</span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Result;
