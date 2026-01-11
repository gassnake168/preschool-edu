import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function ParentChildManager({ isOpen, onClose, user, showDialog, onDataChanged }) {
    const [myChildren, setMyChildren] = useState([]);

    useEffect(() => {
        if (isOpen && user.username) {
            fetchMyChildren();
        }
    }, [isOpen, user.username]);

    const fetchMyChildren = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/students/my?parentUsername=${user.username}`);
            const data = await res.json();
            if (Array.isArray(data)) setMyChildren(data);
        } catch (e) { /* Error handled silently */ }
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            gender: formData.get('gender'),
            age: parseInt(formData.get('age')),
            parentPhone: formData.get('parentPhone'),
            parentUsername: user.username
        };

        try {
            const res = await fetch('http://localhost:8080/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchMyChildren();
                if (onDataChanged) onDataChanged(); // Notify parent to refresh if needed (e.g. course list might show relevant info)
                form.reset();
                showDialog("成功", "信息已添加", "success");
            }
        } catch (e) { showDialog("错误", "保存失败", "danger"); }
    };

    const handleDeleteChild = async (childId) => {
        if (confirm("确定要删除该孩子信息吗？")) {
            await fetch(`http://localhost:8080/api/students/${childId}`, { method: 'DELETE' });
            fetchMyChildren();
            if (onDataChanged) onDataChanged();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
                {/* 左侧：添加孩子 */}
                <div className="p-8 md:w-2/5 bg-orange-50 border-r border-orange-100">
                    <h3 className="text-xl font-bold text-orange-900 mb-6 flex items-center gap-2">
                        <Plus className="bg-orange-500 text-white rounded-full p-1" size={24} /> 孩子信息
                    </h3>
                    <form onSubmit={handleAddChild} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-orange-800 mb-1">孩子姓名</label>
                            <input required name="name" type="text" className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="输入姓名" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <CustomSelect
                                label="性别"
                                name="gender"
                                options={[
                                    { value: 'M', label: '男孩' },
                                    { value: 'F', label: '女孩' }
                                ]}
                                value="M"
                                primaryColor="orange"
                            />
                            <div>
                                <label className="block text-sm font-bold text-orange-800 mb-1">年龄</label>
                                <input required name="age" type="number" className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl outline-none" placeholder="岁" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-orange-800 mb-1">家长手机号</label>
                            <input required name="parentPhone" type="tel" className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl outline-none" placeholder="输入手机号" />
                        </div>
                        <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all mt-4">确认添加</button>
                    </form>
                </div>

                {/* 右侧：孩子列表 */}
                <div className="p-8 md:w-3/5 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">已登记的孩子</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {myChildren.map(child => (
                            <div key={child.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                        {child.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{child.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-bold">
                                                {child.gender === 'M' ? '男孩' : '女孩'} · {child.age}岁
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">手机: {child.parentPhone}</div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteChild(child.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {myChildren.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">暂无孩子信息</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
