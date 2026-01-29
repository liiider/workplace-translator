import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Terminal,
    Cpu,
    UserX,
    Users,
    Briefcase,
    SlidersHorizontal,
    Sparkles,
    ShieldCheck,
    MessageSquare,
    Zap,
    Image as ImageIcon,
    Camera,
    X,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { uploadFile } from '../lib/dify';

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

const Home = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('decode');
    const [persona, setPersona] = useState('boss');
    const [inputText, setInputText] = useState('');
    const [fireLevel, setFireLevel] = useState(2);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileId, setFileId] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 预览
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            console.log('[Home] Starting file upload...', file.name);
            const result = await uploadFile(file);
            console.log('[Home] Upload result:', result);
            setFileId(result.id);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('图片上传失败，请重试');
            setFilePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setFileId(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTranslate = () => {
        if (!inputText.trim() && !fileId) return;
        navigate('/result', { state: { inputText, fireLevel, mode, persona, fileId } });
    };

    const rangeStyle = {
        '--value': `${((fireLevel - 1) / (3 - 1)) * 100}%`
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative w-full max-w-md h-[100dvh] flex flex-col bg-background-light dark:bg-zinc-950 shadow-2xl overflow-hidden mx-auto font-display antialiased selection:bg-purple-500/30"
        >
            {/* 渐变装饰背景 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="h-10 w-full shrink-0"></div>

            <motion.header
                variants={itemVariants}
                className="flex flex-col items-center justify-center px-4 pb-8 pt-2 z-10 relative"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 font-display">
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-purple-500 text-2xl font-black"
                        >
                            &gt;_
                        </motion.span>
                        <h1 className="text-zinc-100 text-3xl font-bold tracking-normal">你到底在说啥</h1>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">v2.1</span>
                </div>
                <div className="flex gap-4 items-center pl-1">
                    <div className="flex items-center gap-1.5 focus-ring">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-pulse"></span>
                        <p className="text-zinc-500 text-[11px] font-bold tracking-[0.25em] font-mono uppercase">情绪降噪</p>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-pulse"></span>
                        <p className="text-zinc-500 text-[11px] font-bold tracking-[0.25em] font-mono uppercase">意图解码</p>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500/60 animate-pulse"></span>
                        <p className="text-zinc-500 text-[11px] font-bold tracking-[0.25em] font-mono uppercase">向上管理</p>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1 w-full px-5 py-2 flex flex-col gap-5 pb-28 z-10 no-scrollbar relative overflow-y-auto">
                <div className="h-1"></div>

                {/* 对方身份 - 极致卡片 */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 shrink-0">
                    <div className="flex items-center gap-3 pl-1">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 glassmorphism shadow-[0_4px_12px_rgba(168,85,247,0.05)]">
                            <ShieldCheck className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-zinc-300 text-lg font-display font-black tracking-tight">对象身份</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'boss', name: '暴躁老板', icon: UserX },
                            { id: 'colleague', name: '甩锅同事', icon: Users },
                            { id: 'client', name: '刁钻甲方', icon: Briefcase },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setPersona(item.id)}
                                className={cn(
                                    "relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-500 border overflow-hidden group",
                                    persona === item.id
                                        ? "bg-purple-600/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30"
                                        : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/80 text-zinc-500"
                                )}
                            >
                                <motion.div
                                    animate={persona === item.id ? {
                                        rotate: [0, 4, 0],
                                        scale: [1, 1, 1]
                                    } : { rotate: 0, scale: 1 }}
                                    transition={persona === item.id ? {
                                        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                    } : { duration: 0.3 }}
                                    className={cn(
                                        "p-3 rounded-xl relative",
                                        persona === item.id
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                                            : "bg-zinc-800/50 text-zinc-600 transition-colors duration-300"
                                    )}
                                >
                                    <item.icon className="w-6 h-6 relative z-10" />
                                </motion.div>
                                <span className={cn(
                                    "text-[13px] font-bold tracking-tight transition-colors duration-500",
                                    persona === item.id ? "text-zinc-100" : "text-zinc-500"
                                )}>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* 输入内容 - 真核终端 */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 relative group/input shrink-0">
                    <div className="flex items-center gap-3 pl-1">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 glassmorphism shadow-[0_4px_12px_rgba(168,85,247,0.05)]">
                            <Terminal className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-zinc-300 text-lg font-display font-black tracking-tight">内容输入</h3>
                    </div>
                    <div className={cn(
                        "relative flex flex-col bg-zinc-950/80 backdrop-blur-xl rounded-2xl border transition-all duration-500 shadow-2xl overflow-hidden",
                        isInputFocused
                            ? "border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-zinc-950"
                            : "border-zinc-800/80"
                    )}>
                        <div className={cn(
                            "flex items-center justify-between px-4 py-3 border-b transition-colors duration-500",
                            isInputFocused ? "bg-purple-500/5 border-purple-500/20" : "bg-zinc-900/80 border-zinc-800/50"
                        )}>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.4)]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.4)]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.4)]"></div>
                            </div>
                            <span className={cn(
                                "text-[11px] font-tech tracking-widest uppercase font-bold transition-colors duration-500",
                                isInputFocused ? "text-purple-400" : "text-zinc-400"
                            )}>STREAM: INPUT_META.SYS</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => !inputText.trim() && fileInputRef.current?.click()}
                                    disabled={!!inputText.trim() || isUploading}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        (!!inputText.trim() || isUploading)
                                            ? "text-zinc-600 cursor-not-allowed opacity-50"
                                            : "text-zinc-400 hover:bg-white/10 hover:text-purple-400"
                                    )}
                                    title={inputText.trim() ? "输入文字时不能上传图片" : "上传图片"}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex relative">
                            <div className="flex flex-col items-center pt-4 pb-4 px-3 text-[11px] font-mono text-zinc-700 bg-zinc-900/30 select-none border-r border-zinc-800/50 w-12 shrink-0 leading-[1.6]">
                                <span>01</span>
                                <span>02</span>
                                <span>03</span>
                                <span>04</span>
                                <span>05</span>
                                <span>06</span>
                                <span>07</span>
                                <span>08</span>
                            </div>
                            <div className="relative flex-1">
                                <textarea
                                    className={cn(
                                        "w-full min-h-[160px] max-h-[30vh] bg-transparent text-zinc-200 placeholder:text-zinc-700 p-4 text-[15px] font-serif focus:outline-none scroll-smooth resize-none border-none outline-none ring-0 leading-relaxed caret-purple-500 no-scrollbar overflow-y-auto",
                                        fileId && "opacity-50 cursor-not-allowed"
                                    )}
                                    placeholder={fileId ? "> 已上传图片，点击图片周围 X 移除后可输入文字..." : "> 粘贴内容，开始翻译..."}
                                    value={inputText}
                                    onFocus={() => !fileId && setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    onChange={(e) => !fileId && setInputText(e.target.value)}
                                    readOnly={!!fileId}
                                ></textarea>

                                {filePreview && (
                                    <div className="absolute bottom-4 left-4 z-30 group/preview">
                                        <div className="relative rounded-lg overflow-hidden border border-purple-500/50 shadow-lg shadow-purple-500/20">
                                            <img src={filePreview} alt="preview" className="w-20 h-20 object-cover" />
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                                </div>
                                            )}
                                            <button
                                                onClick={removeFile}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 底部渐变遮罩 - 与结果页对齐 */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent pointer-events-none z-20"></div>
                            </div>

                            {/* 扫描线效果 */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
                        </div>
                    </div>
                </motion.div>

                {/* 火力调节 - 霓虹调节器 */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center pl-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 glassmorphism shadow-[0_4px_12px_rgba(168,85,247,0.05)]">
                                <SlidersHorizontal className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-zinc-300 text-lg font-display font-black tracking-tight">火力调节</h3>
                        </div>
                        <motion.div
                            key={fireLevel}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-tech font-bold text-[11px] px-3 py-1 rounded-md tracking-widest"
                        >
                            LV.{fireLevel}
                        </motion.div>
                    </div>

                    <div className="relative h-12 flex items-center px-1">
                        {/* 自定义进度条背景 - 轨道 */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{ width: `${((fireLevel - 1) / 2) * 100}%` }}
                                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            />
                        </div>

                        {/* 交互层 */}
                        <input
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                            max="3"
                            min="1"
                            step="1"
                            type="range"
                            value={fireLevel}
                            onChange={(e) => setFireLevel(parseInt(e.target.value))}
                        />

                        {/* 自定义滑块 Thumb - 亮点 */}
                        <div className="relative w-full h-full pointer-events-none">
                            <motion.div
                                initial={false}
                                animate={{ left: `${((fireLevel - 1) / 2) * 100}%` }}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 bg-white rounded-full shadow-[0_0_20px_#a855f7,0_0_40px_rgba(168,85,247,0.4)] z-20"
                            >
                                <div className="absolute inset-1 rounded-full bg-purple-500/20 ring-1 ring-purple-400/50"></div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex justify-between relative mt-2">
                        {[
                            { val: 1, label: '卑微求生' },
                            { val: 2, label: '不卑不亢' },
                            { val: 3, label: '正面硬刚' }
                        ].map((s) => (
                            <div key={s.val} className={cn(
                                "flex-1 transition-all duration-500 flex flex-col items-center",
                                s.val === 1 ? "items-start" : s.val === 3 ? "items-end" : "items-center"
                            )}>
                                <div
                                    onClick={() => setFireLevel(s.val)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg border transition-all duration-500 cursor-pointer",
                                        fireLevel === s.val
                                            ? "bg-purple-600/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                            : "bg-transparent border-transparent"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[13px] font-display font-black tracking-tight transition-all duration-300 block",
                                        fireLevel === s.val
                                            ? "text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                            : "text-zinc-600 hover:text-zinc-400"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main >

            {/* 一键净化按钮 - 精修版 */}
            < motion.div
                variants={itemVariants}
                className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20"
            >
                <div className="relative group/btn">
                    {/* 背景霓虹辉光 - 稍微增强以适配实心按钮 */}
                    <div className={cn(
                        "absolute -inset-[2px] rounded-2xl blur-2xl transition-all duration-700 opacity-30 group-hover/btn:opacity-60 bg-purple-500/40"
                    )}></div>
                    <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTranslate}
                        disabled={(!inputText.trim() && !fileId) || isUploading}
                        className={cn(
                            "w-full h-14 relative overflow-hidden rounded-2xl flex items-center justify-center gap-3 transition-all duration-500",
                            "bg-purple-600 text-white font-display font-black text-lg shadow-[0_8px_30px_rgba(168,85,247,0.4)]",
                            (!inputText.trim() && !fileId) || isUploading ? "opacity-90 cursor-not-allowed" : ""
                        )}
                    >
                        {/* 内部微光流柱 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>

                        <span className={cn(
                            "material-symbols-outlined text-[24px] text-white transition-transform duration-500",
                            inputText.trim() && "group-hover/btn:rotate-12"
                        )}>
                            auto_fix_high
                        </span>
                        <span className="tracking-[0.1em] uppercase">来吧老弟</span>
                    </motion.button>
                </div>
            </motion.div >
        </motion.div >
    );
};

export default Home;
