import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, X } from 'lucide-react';

export default function AiAssistant({ isOpen, onClose, showDialog }) {
    const [aiInput, setAiInput] = useState({ studentName: '', keywords: '' });
    const [aiResult, setAiResult] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiInput.studentName || !aiInput.keywords) {
            showDialog("提示", "请填写完整的学生姓名和关键词", "info");
            return;
        }
        setIsAiLoading(true); setAiResult('');
        try {
            const response = await fetch('http://localhost:8080/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiInput)
            });
            const data = await response.json();
            setAiResult(data.result);
        } catch (e) {
            showDialog("失败", "AI 生成失败，请检查网络", "danger");
        } finally { setIsAiLoading(false); }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(aiResult);
        showDialog("成功", "评语已复制到剪贴板！", "success");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <Sparkles className="w-6 h-6 animate-pulse text-indigo-500" />
                        <h3 className="text-xl font-bold">AI 智能评语助手</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">学生姓名</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            placeholder="例如：小糯米"
                            value={aiInput.studentName}
                            onChange={e => setAiInput({ ...aiInput, studentName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">行为关键词 (输入几个词，AI 帮你写)</label>
                        <textarea
                            className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-24 resize-none placeholder-gray-400"
                            placeholder="例如：吃饭香，午睡快，乐于助人，画画专注..."
                            value={aiInput.keywords}
                            onChange={e => setAiInput({ ...aiInput, keywords: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        onClick={handleAiGenerate}
                        disabled={isAiLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                    >
                        {isAiLoading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                AI 正在思考中...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                一键生成高情商评语
                            </>
                        )}
                    </button>

                    {aiResult && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100 shadow-inner relative group animate-in slide-in-from-bottom-2">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">生成结果</h4>
                            <p className="text-gray-700 leading-relaxed text-justify">{aiResult}</p>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors"
                                title="复制内容"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
