import React, { useState, useEffect } from 'react';
import {
    Check, X, Plus, Calendar, Clock, MapPin, Users, ChevronRight, Search,
    MoreHorizontal, Filter, Loader2, Sparkles, AlertCircle, LogOut, Settings,
    Trash2, UserPlus, Eye, EyeOff, AlertTriangle, CheckCircle, Info,
    User, Pencil, BookOpen, Baby
} from 'lucide-react';
import CustomSelect from './components/CustomSelect';
import AccountManager from './components/AccountManager';
import ResourceManager from './components/ResourceManager';
import ProfileModal from './components/ProfileModal';
import AiAssistant from './components/AiAssistant';
import ParentChildManager from './components/ParentChildManager';

// --- 自定义通用模态框组件 ---
const GlobalModal = ({ isOpen, type, title, message, onConfirm, onCancel, showCancel }) => {
    if (!isOpen) return null;

    // 根据类型配置颜色和图标
    const config = {
        danger: { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-8 h-8" />, btn: 'bg-red-600 hover:bg-red-700' },
        success: { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-8 h-8" />, btn: 'bg-teal-600 hover:bg-teal-700' },
        info: { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <Info className="w-8 h-8" />, btn: 'bg-indigo-600 hover:bg-indigo-700' }
    }[type] || { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <Info className="w-8 h-8" />, btn: 'bg-indigo-600 hover:bg-indigo-700' };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all scale-100 overflow-hidden border border-gray-100">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full ${config.bg} ${config.color} mb-4`}>
                        {config.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed text-sm">{message}</p>
                    <div className="flex gap-3 justify-center">
                        {showCancel && (
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full"
                            >
                                取消
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-md transition-all w-full ${config.btn}`}
                        >
                            确认
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 给 user 添加默认值，防止在没有传参时（如预览模式）报错
export default function CourseList({ user = { username: '预览用户', role: 'admin' }, onLogout }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 资源选项状态 ---
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]); // 后端获取的学生名单


    // --- 添加/编辑课程弹窗 ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        id: null, name: '', teacherName: '', location: '', description: '',
        courseDate: '', courseTime: '', courseEndTime: '', // 增加结束时间
        students: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 组件化 Modal 状态 ---
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isParentChildModalOpen, setIsParentChildModalOpen] = useState(false);

    // --- 个人信息管理 ---
    const [currentUser, setCurrentUser] = useState(user);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // --- 全局 Modal 状态 ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info', // info, danger, success
        title: '',
        message: '',
        onConfirm: () => { },
        showCancel: false
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    // 封装通用显示函数
    const showDialog = (title, message, type = 'info', onConfirmAction = null, showCancel = false) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            showCancel,
            onConfirm: () => {
                if (onConfirmAction) onConfirmAction();
                closeModal();
            },
            onCancel: closeModal
        });
    };

    useEffect(() => {
        fetchCourses();
        fetchAllResources();
        fetchStudentOptions(); // 获取所有学生，供园长分配课程

        // 如果是老师且没有称呼，强制弹窗
        if (user.role === 'teacher' && !user.realName) {
            setIsProfileModalOpen(true);
        }
    }, []);


    const fetchStudentOptions = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/students');
            const data = await res.json();
            if (Array.isArray(data)) setStudentOptions(data);
        } catch (e) { /* Error handled silently */ }
    };


    const fetchCourses = async () => {
        try {
            let url = 'http://localhost:8080/api/courses';
            const params = new URLSearchParams();
            if (user.role === 'teacher') {
                params.append('teacherName', currentUser.realName || user.username);
            } else if (user.role === 'parent') {
                params.append('parentUsername', user.username);
            }
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);

            const data = await response.json();
            if (Array.isArray(data)) {
                setCourses(data);
            } else {
                setCourses([]);
            }
        } catch (err) { setError('加载课程失败'); } finally { setLoading(false); }
    };

    const fetchAllResources = () => {
        fetchResources(1, setSubjects);
        fetchTeachers();
        fetchResources(3, setLocations);
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users/teachers');
            const data = await res.json();
            if (Array.isArray(data)) setTeachers(data);
            else setTeachers([]);
        } catch (e) { /* Error handled silently */ setTeachers([]); }
    };

    const fetchResources = async (type, setState) => {
        try {
            const res = await fetch(`http://localhost:8080/api/resources?type=${type}`);
            const data = await res.json();
            if (Array.isArray(data)) setState(data);
            else setState([]);
        } catch (e) { /* Error handled silently */ setState([]); }
    };

    // --- 处理课程表单提交 (新增 或 修改) ---
    const handleCourseSubmit = async (e) => {
        e.preventDefault();

        // --- 增强表单校验 ---
        const { name, teacherName, location, courseDate, courseTime, courseEndTime } = newCourse;
        if (!name || !teacherName || !location || !courseDate || !courseTime || !courseEndTime) {
            showDialog("填写未完成", "课程名称、老师、地点及时间均为必填项，请完整填写后再试。", "danger");
            return;
        }

        // 校验时间逻辑：下课时间必须晚于上课时间
        if (courseTime >= courseEndTime) {
            showDialog("时间设置不当", "下课时间必须晚于上课时间，请重新调整。", "danger");
            return;
        }

        setIsSubmitting(true);

        const finalCourseData = { ...newCourse, classTime: `${newCourse.courseDate} ${newCourse.courseTime}-${newCourse.courseEndTime}` };
        const isEdit = !!newCourse.id;
        const url = isEdit
            ? `http://localhost:8080/api/courses/${newCourse.id}`
            : 'http://localhost:8080/api/courses';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalCourseData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchCourses();
                showDialog("操作成功", isEdit ? "课程修改成功！" : "课程发布成功！", "success");
                resetCourseForm();
            } else {
                showDialog("操作失败", "无法保存课程信息，请重试。", "danger");
            }
        } catch (err) {
            showDialog("错误", "服务器连接失败", "danger");
        } finally { setIsSubmitting(false); }
    };

    const openAddModal = () => {
        resetCourseForm();
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        // 尝试解析日期时间，例如 "2026-01-20 09:00-10:00"
        let d = '', st = '', et = '';
        if (course.classTime && course.classTime.includes(' ')) {
            const parts = course.classTime.split(' ');
            if (parts[0].includes('-')) {
                d = parts[0];
                if (parts[1].includes('-')) {
                    const times = parts[1].split('-');
                    st = times[0];
                    et = times[1];
                } else {
                    st = parts[1];
                }
            }
        }

        setNewCourse({
            id: course.id,
            name: course.name,
            teacherName: course.teacherName,
            location: course.location,
            courseDate: d || new Date().toISOString().split('T')[0],
            courseTime: st || '09:00',
            courseEndTime: et || '10:00',
            description: course.description || '',
            students: course.students || []
        });
        setIsModalOpen(true);
    };


    const resetCourseForm = () => {
        setNewCourse({
            id: null, name: '', teacherName: '', location: '', description: '',
            courseDate: new Date().toISOString().split('T')[0],
            courseTime: '09:00',
            courseEndTime: '10:00',
            students: []
        });
    };


    // --- 删除课程 (使用新 Modal) ---
    const handleDeleteCourse = (id) => {
        showDialog(
            "确认删除",
            "确定要删除这门课程吗？删除后无法恢复！",
            "danger",
            async () => {
                try {
                    const res = await fetch(`http://localhost:8080/api/courses/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchCourses();
                        setTimeout(() => showDialog("删除成功", "课程已成功删除", "success"), 300);
                    } else {
                        showDialog("删除失败", "操作无法完成", "danger");
                    }
                } catch (e) {
                    showDialog("错误", "服务器错误", "danger");
                }
            },
            true
        );
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* 全局 Modal 挂载点 */}
            <GlobalModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                showCancel={modalConfig.showCancel}
            />

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">课程管理</h1>
                    <p className="text-gray-500 mt-1">
                        欢迎回来，{currentUser.realName || currentUser.username} ({currentUser.role === 'admin' ? '园长' : '老师'})
                    </p>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3">
                    {(user.role === 'admin' || user.role === 'teacher') && (
                        <button onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg shadow-blue-200 transition-all active:scale-95">
                            <Sparkles size={18} /> AI 评语助手
                        </button>
                    )}

                    {user.role === 'teacher' && (
                        <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-xl hover:bg-teal-600 shadow-teal-200 transition-all active:scale-95">
                            <User size={18} /> 我的名片
                        </button>
                    )}

                    {user.role === 'parent' && (
                        <button onClick={() => setIsParentChildModalOpen(true)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 shadow-orange-200 transition-all active:scale-95">
                            <Baby size={18} /> 我的孩子
                        </button>
                    )}


                    {user.role === 'admin' && (
                        <button onClick={() => setIsResourceModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 shadow-purple-200 transition-all active:scale-95">
                            <Settings size={18} /> 基础数据
                        </button>
                    )}

                    {user.role === 'admin' && (
                        <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-blue-200 transition-all active:scale-95">
                            <User size={18} /> 管理账号
                        </button>
                    )}

                    {user.role === 'admin' && (
                        <button onClick={openAddModal} className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-teal-200 shadow-md transition-all active:scale-95">
                            <Plus size={20} /> 新建课程
                        </button>)}

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 bg-white transition-all font-medium active:scale-95"
                        title="退出登录"
                    >
                        <LogOut size={18} />
                        <span>退出</span>
                    </button>
                </div>
            </header>

            {loading && <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-600 w-8 h-8" /></div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 修改重点：这里加入了 index 参数，并使用 index + 1 显示序号 */}
                {courses.map((course, index) => (
                    <div
                        key={course.id}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                        {/* 上半部分内容区域 */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-50 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-teal-600" />
                                </div>
                                {/* 这里把 course.id 改为了 index + 1，这样即使数据库ID是3，这里也会显示 #1 */}
                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">#{index + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{course.description}</p>

                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User size={16} className="text-gray-400" />
                                    <span>{course.teacherName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>{course.classTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{course.location}</span>
                                </div>
                                {course.students && course.students.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        <span className="text-xs text-gray-400 w-full mb-1">上课学生:</span>
                                        {course.students.map(s => (
                                            <span key={s.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* 底部操作栏：右下角常驻 */}
                        {user.role === 'admin' && (
                            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => openEditModal(course)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                >
                                    <Pencil size={14} /> 编辑
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={14} /> 删除
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* --- 新增/编辑课程 弹窗 --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">{newCourse.id ? '编辑课程' : '发布新课程'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
                            <div>
                                <CustomSelect
                                    label="课程名称"
                                    required
                                    options={subjects.map(s => ({ value: s.name, label: s.name }))}
                                    value={newCourse.name}
                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                    placeholder="请选择课程"
                                    primaryColor="teal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <CustomSelect
                                        label="任课老师"
                                        required
                                        options={teachers.map(t => ({ value: t.name, label: t.name }))}
                                        value={newCourse.teacherName}
                                        onChange={e => setNewCourse({ ...newCourse, teacherName: e.target.value })}
                                        placeholder="请选择老师"
                                        primaryColor="teal"
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="上课地点"
                                        required
                                        options={locations.map(l => ({ value: l.name, label: l.name }))}
                                        value={newCourse.location}
                                        onChange={e => setNewCourse({ ...newCourse, location: e.target.value })}
                                        placeholder="请选择教室"
                                        primaryColor="teal"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">上课日期与时间范围</label>
                                <div className="flex gap-2">
                                    <div className="flex-[2] relative">
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer font-medium text-gray-700"
                                            value={newCourse.courseDate}
                                            onChange={e => setNewCourse({ ...newCourse, courseDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer text-sm font-bold text-teal-600"
                                            value={newCourse.courseTime}
                                            onChange={e => setNewCourse({ ...newCourse, courseTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex-none flex items-center text-gray-400 font-bold">-</div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer text-sm font-bold text-teal-600"
                                            value={newCourse.courseEndTime}
                                            onChange={e => setNewCourse({ ...newCourse, courseEndTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">课程简介</label>
                                <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none h-20 resize-none focus:ring-2 focus:ring-teal-500" placeholder="简要描述..."
                                    value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                            </div>
                            {/* --- 学生选择模块 (仅对园长可见) --- */}
                            {user.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">参加该课的孩子</label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-100 bg-gray-50 rounded-xl min-h-[60px]">
                                        {studentOptions.map(student => {
                                            const isSelected = newCourse.students.some(s => s.id === student.id);
                                            return (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = isSelected
                                                            ? newCourse.students.filter(s => s.id !== student.id)
                                                            : [...newCourse.students, student];
                                                        setNewCourse({ ...newCourse, students: updated });
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isSelected
                                                        ? 'bg-teal-600 text-white shadow-md'
                                                        : 'bg-white text-gray-500 border border-gray-200 hover:border-teal-200'
                                                        }`}
                                                >
                                                    {student.name}
                                                </button>
                                            );
                                        })}
                                        {studentOptions.length === 0 && <span className="text-gray-400 text-xs text-center w-full py-2">暂无学生可选 (请先在后档案管理添加学生)</span>}
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">

                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors">取消</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold flex justify-center items-center gap-2 shadow-lg shadow-teal-100 transition-all active:scale-95">
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check size={18} /> {newCourse.id ? '确认修改' : '确认发布'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 新的组件化弹窗 --- */}
            <AccountManager
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                showDialog={showDialog}
                onDataChanged={fetchTeachers}
            />

            <ResourceManager
                isOpen={isResourceModalOpen}
                onClose={() => setIsResourceModalOpen(false)}
                showDialog={showDialog}
                onDataChanged={fetchAllResources}
                subjects={subjects}
                locations={locations}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={currentUser}
                showDialog={showDialog}
                onUpdate={(newData) => {
                    setCurrentUser(prev => ({ ...prev, ...newData }));
                    setTimeout(fetchCourses, 500);
                }}
                onLogout={onLogout}
            />

            <AiAssistant
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                showDialog={showDialog}
            />

            <ParentChildManager
                isOpen={isParentChildModalOpen}
                onClose={() => setIsParentChildModalOpen(false)}
                user={user}
                showDialog={showDialog}
                onDataChanged={fetchCourses}
            />

        </div>
    );
}
