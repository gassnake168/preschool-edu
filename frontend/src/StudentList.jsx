import React, { useState, useEffect } from 'react';
import {
    Search, Plus, MoreHorizontal, Phone, Tag,
    Baby, Trash2, Edit, X, Check, Loader2, Sparkles, Smile
} from 'lucide-react';
import CustomSelect from './components/CustomSelect';

// --- 复用 CourseList 中的 Modal (为了保持独立性这里简单复制一份，实际开发建议提取公共组件) ---
const GlobalModal = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6 text-sm">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
                    <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-white font-bold ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'}`}>确认</button>
                </div>
            </div>
        </div>
    );
};

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // 模态框状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: '', gender: 'M', age: '', className: '', parentPhone: '', tags: ''
    });

    // 确认框状态
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

    // 数据加载
    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/students');
            const data = await res.json();
            if (Array.isArray(data)) setStudents(data);
        } catch (e) { /* Error handled silently */ } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- 逻辑处理 ---
    const handleAdd = () => {
        setEditingStudent(null);
        setFormData({ name: '', gender: 'M', age: '', className: '', parentPhone: '', tags: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            ...student,
            tags: Array.isArray(student.tags) ? student.tags.join(' ') : (student.tags || '')
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            isOpen: true,
            type: 'danger',
            title: '确认删除档案',
            message: '删除后无法恢复，确定要删除这位小朋友的档案吗？',
            onConfirm: async () => {
                try {
                    await fetch(`http://localhost:8080/api/students/${id}`, { method: 'DELETE' });
                    fetchStudents();
                    setConfirmConfig({ isOpen: false });
                } catch (e) { /* Error handled silently */ }
            },
            onCancel: () => setConfirmConfig({ isOpen: false })
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 映射数据，确保 parentUsername 被填入 (这里简单用 parentPhone)
        // 并在标签处理上保持一致
        const payload = {
            ...formData,
            parentUsername: formData.parentPhone, // 暂定 parentPhone 为登录名
            tags: formData.tags
        };

        if (editingStudent) payload.id = editingStudent.id;

        try {
            const res = await fetch('http://localhost:8080/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchStudents();
            }
        } catch (e) { /* Error handled silently */ }
    };


    // 筛选逻辑
    const filteredStudents = students.filter(s => s.name.includes(searchTerm) || s.className.includes(searchTerm));

    return (
        <div className="p-8 h-full bg-gray-50 min-h-screen">
            <GlobalModal {...confirmConfig} />

            {/* 顶部操作栏 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Baby className="text-orange-500" /> 幼儿成长档案
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">管理全园幼儿信息，记录成长点滴</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜索姓名或班级..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={handleAdd} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 font-medium flex items-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95">
                        <Plus size={18} /> 新增档案
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Smile className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>暂无幼儿数据，快去添加吧</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student.id} className="group bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            {/* 顶部背景装饰 */}
                            <div className={`absolute top-0 left-0 right-0 h-20 opacity-10 ${student.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>

                            {/* 操作按钮 (悬停显示) */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={() => handleEdit(student)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-blue-600 hover:bg-blue-50"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(student.id)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                            </div>

                            <div className="relative flex flex-col items-center mt-4">
                                {/* 动态头像 API */}
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                    alt="avatar"
                                    className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 mb-3"
                                />
                                <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                                <div className="text-xs font-medium text-gray-500 mb-4 flex gap-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{student.className}</span>
                                    <span>{student.gender === 'M' ? '👦 男孩' : '👧 女孩'}</span>
                                    <span>{student.age}岁</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>{student.parentPhone || '未绑定家长'}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {((student.tags && typeof student.tags === 'string') ? student.tags.split(' ') : (student.tags || [])).map((tag, i) => (
                                        tag && <span key={i} className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                                            #{tag}
                                        </span>
                                    ))}
                                    {(!student.tags || student.tags.length === 0) && <span className="text-xs text-gray-300 italic">暂无标签</span>}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 新增/编辑弹窗 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
                            <h3 className="font-bold text-orange-900">{editingStudent ? '编辑档案' : '新建档案'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-orange-300 hover:text-orange-600" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                                    <input type="text" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">班级</label>
                                    <input type="text" placeholder="例如：中二班" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomSelect
                                    label="学生性别"
                                    options={[
                                        { value: 'M', label: '男孩' },
                                        { value: 'F', label: '女孩' }
                                    ]}
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">年龄</label>
                                    <input type="number" className="w-full px-3 py-2 border rounded-xl outline-none"
                                        value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">家长联系方式</label>
                                <input type="tel" placeholder="用于关联家长端账号" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">性格/特长标签 <span className="text-gray-400 font-normal">(用空格分隔)</span></label>
                                <input type="text" placeholder="例如：活泼 挑食 乐高高手" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 mt-4">
                                保存档案
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}