import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function ProfileModal({ isOpen, user, onUpdate, onClose, showDialog, onLogout }) {
    const [profileData, setProfileData] = useState({
        realName: user.realName || '',
        phone: user.phone || '',
        gender: user.gender || '女'
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            const res = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    username: user.username,
                    ...profileData
                })
            });
            const data = await res.json();
            if (data.code === 200) {
                if (onUpdate) onUpdate(profileData);
                if (onClose) onClose();
                showDialog("完成", "个人信息已成功录入，祝您工作愉快！", "success");
            } else {
                showDialog("失败", data.message, "danger");
            }
        } catch (err) {
            showDialog("错误", "连接服务器失败", "danger");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative">
                <div className="bg-teal-600 p-6 text-center pt-8 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-teal-600 shadow-lg mb-4 relative z-10">
                        <User size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white relative z-10">完善您的名片</h2>
                    <p className="text-teal-100 mt-2 text-sm relative z-10">为了方便家长认识您，请完善基本信息</p>
                </div>

                <div className="px-8 py-8 -mt-6 bg-white rounded-t-3xl relative z-20">
                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">您的称呼</label>
                            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="例如：王老师"
                                value={profileData.realName}
                                onChange={e => setProfileData({ ...profileData, realName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">联系电话</label>
                            <input required type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="方便家长联系您"
                                value={profileData.phone}
                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <CustomSelect
                                label="性别"
                                required
                                options={[{ value: '女', label: '女士' }, { value: '男', label: '先生' }]}
                                value={profileData.gender}
                                onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                                placeholder="请选择性别"
                                primaryColor="teal"
                            />
                        </div>

                        <button type="submit" className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-95 transition-all mt-4">
                            保存并进入系统
                        </button>

                        <button type="button" onClick={onLogout} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-1">
                            <LogOut size={14} /> 暂不填写，退出登录
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
