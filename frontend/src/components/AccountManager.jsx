import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AccountManager({ isOpen, onClose, showDialog, onDataChanged }) {
    const [usersList, setUsersList] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'teacher' });
    const [showUserPasswordId, setShowUserPasswordId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsersList(data);
        } catch (e) {
            showDialog("错误", "无法加载用户列表", "danger");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (newUser.username.length > 20 || newUser.password.length > 30) {
            showDialog("提示", "用户名(<20)或密码(<30)超长", "info");
            return;
        }
        try {
            const res = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (data.code === 200) {
                setNewUser({ username: '', password: '', role: 'teacher' });
                fetchUsers();
                if (onDataChanged) onDataChanged();
                showDialog("成功", "账号已创建", "success");
            } else {
                showDialog("失败", data.message, "danger");
            }
        } catch (e) { showDialog("错误", "创建失败", "danger"); }
    };

    const handleDeleteUser = (id, targetUsername) => {
        if (targetUsername === 'admin') {
            showDialog("提示", "初始管理员账号不能删除", "info");
            return;
        }
        showDialog(
            "确认删除",
            `确定要删除账号 ${targetUsername} 吗？`,
            "danger",
            async () => {
                try {
                    await fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' });
                    fetchUsers();
                    if (onDataChanged) onDataChanged();
                } catch (e) { showDialog("错误", "删除失败", "danger"); }
            },
            true
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
                {/* 左侧：添加账号 */}
                <div className="p-8 md:w-2/5 bg-blue-50 border-r border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                        <Plus className="bg-blue-600 text-white rounded-full p-1" size={24} /> 新增账号
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-blue-800 mb-1">用户名(不超过20字)</label>
                            <input required type="text" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="请输入用户名" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-blue-800 mb-1">密码(不超过30字)</label>
                            <input required type="text" className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="请输入密码" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-blue-800 mb-1">账号类型</label>
                            <div className="flex bg-white p-1 rounded-xl border border-blue-100">
                                {['teacher', 'parent'].map(r => (
                                    <button key={r} type="button" onClick={() => setNewUser({ ...newUser, role: r })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${newUser.role === r ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                                        {r === 'teacher' ? '教师' : '家长'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-4">确认添加</button>
                    </form>
                </div>

                {/* 右侧：账号列表 */}
                <div className="p-8 md:w-3/5 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">所有账号</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {usersList.map(u => (
                            <div key={u.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{u.realName ? `${u.realName} (@${u.username})` : u.username}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : u.role === 'teacher' ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {u.role === 'admin' ? '园长' : u.role === 'teacher' ? '教师' : '家长'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>User ID: {u.id}</span>
                                        {/* Password is no longer available in frontend for security */}
                                    </div>
                                </div>
                                {u.username !== 'admin' && (
                                    <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {usersList.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">暂无账号信息</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
