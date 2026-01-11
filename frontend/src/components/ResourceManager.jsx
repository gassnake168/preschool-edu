import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function ResourceManager({ isOpen, onClose, showDialog, onDataChanged, subjects = [], locations = [] }) {
    const [resourceTab, setResourceTab] = useState(1);
    const [newResourceName, setNewResourceName] = useState('');

    const handleAddResource = async () => {
        if (!newResourceName.trim()) return;
        try {
            await fetch('http://localhost:8080/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newResourceName, type: resourceTab })
            });
            setNewResourceName('');
            if (onDataChanged) onDataChanged();
        } catch (e) { showDialog("错误", "添加资源失败", "danger"); }
    };

    const handleDeleteResource = (id) => {
        showDialog(
            "确认删除",
            "确定要删除这个选项吗？",
            "danger",
            async () => {
                try {
                    await fetch(`http://localhost:8080/api/resources/${id}`, { method: 'DELETE' });
                    if (onDataChanged) onDataChanged();
                } catch (e) { showDialog("错误", "删除失败", "danger"); }
            },
            true
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                    <h3 className="text-xl font-bold text-purple-900">基础数据管理</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6">
                    {/* 顶部 Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        {[{ id: 1, name: '科目' }, { id: 3, name: '教室' }].map(tab => (
                            <button key={tab.id} onClick={() => setResourceTab(tab.id)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${resourceTab === tab.id ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}>
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* 添加输入框 */}
                    <div className="flex gap-2 mb-6">
                        <input type="text" className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder={`输入新${resourceTab === 1 ? '科目' : '教室'}名称...`}
                            value={newResourceName} onChange={e => setNewResourceName(e.target.value)}
                        />
                        <button onClick={handleAddResource} className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 font-medium shadow-md shadow-purple-100 transition-all active:scale-95">添加</button>
                    </div>

                    {/* 列表展示 */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {(resourceTab === 1 ? subjects : locations).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                <span className="text-gray-700 font-medium">{item.name}</span>
                                <button onClick={() => handleDeleteResource(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {(resourceTab === 1 ? subjects : locations).length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-4">暂无数据，请添加</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
