import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Baby, GraduationCap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import CourseList from './CourseList';

export default function App() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. 如果已经登录，直接显示课程列表页
    if (user) {
        return <CourseList user={user} onLogout={() => setUser(null)} />;
    }

    // 2. 处理输入变化
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('请输入用户名和密码');
            return;
        }

        setIsLoading(true);

        try {
            // 发送登录请求 (不再发送 role，由后端决定)
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.code === 200) {
                // 登录成功！使用后端返回的 role
                setUser({
                    username: formData.username,
                    role: data.role,
                    token: data.token,
                    realName: data.realName,
                    phone: data.phone,
                    gender: data.gender
                });
            } else {
                setError(data.message || '登录失败');
            }
        } catch (err) {
            setError('连接服务器失败，请检查后端是否启动');
        } finally {
            setIsLoading(false);
        }
    };

    // 登录页固定使用一套温馨的配色 (不再随角色变动，因为登录前不知道角色)
    const config = {
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        buttonColor: 'bg-teal-600 hover:bg-teal-700',
        title: '阳光幼教管理系统',
        subtitle: '用心教育，用爱灌溉，守护每一个孩子的成长',
        icon: <GraduationCap className="w-12 h-12 text-teal-600" />
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-teal-50 relative overflow-hidden font-sans">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row mx-4">
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900">{config.title}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{config.subtitle}</p>
                    </div>

                    {/* 删除了角色切换按钮组 */}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">用户名</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="admin / teacher1 / parent1" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">密码</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="123456" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                            </div>
                        </div>
                        {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>}
                        <button type="submit" disabled={isLoading} className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all hover:opacity-90 ${config.buttonColor} disabled:opacity-70`}>
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : '立即登录'}
                        </button>
                    </form>
                </div>
                <div className={`hidden md:flex w-1/2 ${config.bgColor} p-12 flex-col items-center justify-center text-center`}>
                    <div className="bg-white p-6 rounded-full shadow-lg mb-8">{config.icon}</div>
                    <h3 className={`text-2xl font-bold mb-4 ${config.color}`}>欢迎使用阳光幼教云</h3>
                    <p className="text-gray-600 max-w-xs">系统已升级自动识别身份。输入对应账号即可进入不同工作台。</p>
                </div>
            </div>
        </div>
    );
}