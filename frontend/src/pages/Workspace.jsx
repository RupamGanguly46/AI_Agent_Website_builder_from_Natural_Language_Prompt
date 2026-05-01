import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getProject,
    getFiles,
    getCommits,
    getMessages,
    sendPrompt,
    revertToCommit,
    startDevServer,
    getServerStatus,
    getFileContent,
    updateFileContent,
    SERVER_URL
} from '../api/api';
import Loader from '../components/Loader';

// ─── Inline Styles ──────────────────────────────────────────────────────────
const styles = `
    .ws-glass-panel {
        background: rgba(19, 19, 21, 0.6);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .ws-premium-btn { position: relative; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: visible; }
    .ws-premium-btn::before { content: ''; position: absolute; inset: -4px; background: #adc6ff; border-radius: 9999px; filter: blur(12px); opacity: 0; z-index: -1; transition: opacity 0.4s ease; }
    .ws-premium-btn:hover::before { opacity: 0.6; }
    .ws-btn-save { background: linear-gradient(135deg, #2a2a2c 0%, #353437 100%); border: 1px solid rgba(255,255,255,0.1); }
    .ws-btn-deploy { background: linear-gradient(135deg, #adc6ff 0%, #455e90 100%); box-shadow: 0 4px 12px rgba(173,198,255,0.2); }
    .ws-server-running { background-color: #EF4444 !important; box-shadow: 0 0 20px rgba(239,68,68,0.4); }
    .ws-server-stopped { background-color: #22C55E !important; box-shadow: 0 0 20px rgba(34,197,94,0.4); }
    .ws-tab-active { background: rgb(19,19,21); color: rgb(216,226,255); border-bottom: 2px solid #adc6ff; }
    .ws-tab-inactive { color: #94a3b8; background: transparent; }
    .ws-panel-tab-active { background: rgba(173,198,255,0.1); color: rgb(216,226,255); }
    .ws-panel-tab-inactive { color: #64748b; }
    .ws-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .ws-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .ws-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2c; border-radius: 10px; }
    .ws-save-notif { transform: translateX(150%); transition: transform 0.3s ease; }
    .ws-save-notif.show { transform: translateX(0); }
    .ws-ai-msg { background: rgba(42,42,44,0.5); border: 1px solid rgba(255,255,255,0.05); }
    .ws-commit-item { background: rgba(32,31,33,0.3); border: 1px solid rgba(255,255,255,0.05); }
    #ws-dashboard-overlay { backdrop-filter: blur(8px); transition: opacity 0.3s ease; }

    /* ── Light Mode UI Overrides (exact from code.html) ──────────── */
    .ws-light { background-color: #F8FAFC !important; color: #1E293B !important; }
    .ws-light header { background-color: rgba(255, 255, 255, 0.9) !important; border-bottom: 1px solid #E2E8F0 !important; }
    .ws-light aside#ws-sidebar { background-color: #F1F5F9 !important; border-right: 1px solid #E2E8F0 !important; }
    .ws-light aside#ws-right-panel { background-color: #F1F5F9 !important; border-left: 1px solid #E2E8F0 !important; }
    .ws-light section#ws-editor-canvas { background-color: #FFFFFF !important; }
    .ws-light #ws-tabs-bar { background-color: #F8FAFC !important; border-bottom: 1px solid #E2E8F0 !important; }

    /* Light Mode Brand & Logo */
    .ws-light .ws-brand-text { color: #0F172A !important; text-shadow: none !important; }
    .ws-light .ws-brand-logo-icon { color: #1E3A8A !important; }

    /* Light Mode Typography */
    .ws-light .ws-primary-text { color: #1E3A8A !important; }
    .ws-light .text-slate-400, .ws-light .text-slate-500, .ws-light .text-slate-600 { color: #475569 !important; }
    .ws-light .ws-file-label { color: #1E293B !important; font-weight: 500; }
    .ws-light .ws-architect-label { color: #0F172A !important; }

    /* Search Bar Light Mode */
    .ws-light .ws-search-container { background-color: #FFFFFF !important; border: 1px solid #CBD5E1 !important; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05) !important; }
    .ws-light .ws-search-input { color: #0F172A !important; }
    .ws-light .ws-search-input::placeholder { color: #94A3B8 !important; }

    /* Icon Colors Light Mode */
    .ws-light .material-symbols-outlined { color: #334155 !important; }
    .ws-light .ws-icon-primary,
    .ws-light .ws-icon-blue,
    .ws-light .ws-icon-yellow { color: #1E3A8A !important; }

    /* Code Editor Light Mode */
    .ws-light #ws-editor-code { background-color: #FDFDFD !important; border-top: 1px solid #E2E8F0 !important; }
    .ws-light .ws-code-textarea { color: #0F172A !important; }

    /* AI Prompt Box Light Mode */
    .ws-light .ws-ai-input { background-color: #FFFFFF !important; border: 1px solid #CBD5E1 !important; color: #0F172A !important; }
    .ws-light .ws-ai-msg { background-color: #FFFFFF !important; color: #1E293B !important; border: 1px solid #E2E8F0 !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important; }
    .ws-light .ws-ai-logo-icon { color: #1E3A8A !important; }

    /* Tab / Panel Specifics */
    .ws-light .ws-tab-active { background-color: #FFFFFF !important; color: #1E3A8A !important; border-bottom: 2px solid #1E3A8A !important; }
    .ws-light .ws-tab-inactive { color: #64748b !important; background: transparent !important; }

    /* Panel Tab Active Light Mode */
    .ws-light .ws-panel-tab-active { background-color: #1E3A8A !important; color: #FFFFFF !important; }
    .ws-light .ws-panel-tab-active .material-symbols-outlined { color: #FFFFFF !important; }
    .ws-light .ws-panel-tab-inactive .material-symbols-outlined { color: #475569 !important; }

    /* Commits Light Mode */
    .ws-light .ws-commit-item { background-color: #FFFFFF !important; border-color: #CBD5E1 !important; }
    .ws-light .ws-commit-title { color: #1E3A8A !important; }
    .ws-light .ws-btn-revert { border: 1px solid #1E3A8A !important; color: #1E3A8A !important; background: transparent !important; }
    .ws-light .ws-btn-revert:hover { background: #1E3A8A !important; color: #FFFFFF !important; }

    /* Premium Buttons Light Mode */
    .ws-light .ws-btn-save { background: #FFFFFF !important; border: 1px solid #CBD5E1 !important; color: #1E3A8A !important; }
    .ws-light .ws-btn-deploy { background: linear-gradient(135deg, #1E40AF 0%, #0F172A 100%) !important; color: #FFFFFF !important; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2) !important; }
    .ws-light .ws-premium-btn::before { background: #1E3A8A !important; }

    /* Glass Panel Light Mode */
    .ws-light .ws-glass-panel { background: rgba(255,255,255,0.85) !important; border: 1px solid #E2E8F0 !important; }

    /* Scrollbar Light Mode */
    .ws-light .ws-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1 !important; }
`;


// ─── File Icon Helper ────────────────────────────────────────────────────────
function getFileIcon(name) {
    if (!name) return { icon: 'draft', color: 'text-slate-400' };
    if (name.endsWith('.ai')) return { icon: 'bolt', color: 'text-[#d8e2ff]' };
    if (name.endsWith('.py')) return { icon: 'code', color: 'text-blue-400' };
    if (name.endsWith('.js') || name.endsWith('.jsx')) return { icon: 'javascript', color: 'text-yellow-500' };
    if (name.endsWith('.css')) return { icon: 'palette', color: 'text-pink-400' };
    if (name.endsWith('.html')) return { icon: 'html', color: 'text-orange-400' };
    if (name.endsWith('.json')) return { icon: 'data_object', color: 'text-green-400' };
    return { icon: 'draft', color: 'text-slate-400' };
}

// ─── Recursive File Tree Node ────────────────────────────────────────────────
function FileNode({ node, depth = 0, onFileClick, openFolders, toggleFolder }) {
    const isFolder = node.isDirectory || node.children;
    const isOpen = openFolders[node.path || node.name];
    const { icon, color } = getFileIcon(node.name);
    const indent = depth * 16;

    if (isFolder) {
        return (
            <div>
                <div
                    className="flex items-center gap-2 text-sm text-slate-400 py-1 cursor-pointer hover:text-white transition-colors"
                    style={{ paddingLeft: `${indent}px` }}
                    onClick={() => toggleFolder(node.path || node.name)}
                >
                    <span className="material-symbols-outlined text-lg">
                        {isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                    </span>
                    <span className="material-symbols-outlined text-lg text-[#ffe16d]">folder</span>
                    <span className="text-xs font-medium">{node.name}</span>
                </div>
                {isOpen && node.children?.map((child, i) => (
                    <FileNode key={i} node={child} depth={depth + 1} onFileClick={onFileClick}
                        openFolders={openFolders} toggleFolder={toggleFolder} />
                ))}
            </div>
        );
    }

    return (
        <button
            className="flex items-center gap-2 text-sm text-slate-400 py-1 w-full text-left hover:text-[#adc6ff] transition-colors"
            style={{ paddingLeft: `${indent + 8}px` }}
            onClick={() => onFileClick(node.path || node.name)}
        >
            <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
            <span className="text-xs">{node.name}</span>
        </button>
    );
}

// ─── Main Workspace Component ────────────────────────────────────────────────
function Workspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // State
    const [project, setProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [commits, setCommits] = useState([]);
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'How can I help you architect your next module?' }]);
    const [serverLogs, setServerLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const [previewPort, setPreviewPort] = useState(null);
    const [serverLoading, setServerLoading] = useState(false);
    const [savingFile, setSavingFile] = useState(false);
    const [rightTab, setRightTab] = useState('ai');
    const [openTabs, setOpenTabs] = useState(['preview']);
    const [activeTab, setActiveTab] = useState('preview');
    const [fileContents, setFileContents] = useState({});
    const [aiInput, setAiInput] = useState('');
    const [openFolders, setOpenFolders] = useState({});
    const [fileSearch, setFileSearch] = useState('');
    const [showSaveNotif, setShowSaveNotif] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const chatRef = useRef(null);
    const { currentUser, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // ── Data Fetching ──────────────────────────────────────────────────────
    const fetchProjectData = useCallback(async () => {
        try {
            const [projRes, filesRes, commitsRes, msgsRes] = await Promise.all([
                getProject(projectId),
                getFiles(projectId),
                getCommits(projectId),
                getMessages(projectId),
            ]);
            setProject(projRes.data);
            setFiles(filesRes.data);
            setCommits(commitsRes.data);
            if (msgsRes.data?.length > 0) setMessages(msgsRes.data);
        } catch (err) {
            console.error('Failed to load project:', err);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectData();
        checkServerStatus();
    }, [fetchProjectData]);

    // ── Server-Sent Events (Logs) ───────────────────────────────────────────────
    useEffect(() => {
        if (!projectId) return;

        let eventSource;
        const initSSE = async () => {
            let token = '';
            if (currentUser) {
                try {
                    // Force a non-stale refresh token via the Firebase parameter (fixes the 1-hour expiry loop)
                    token = await currentUser.getIdToken(true);
                } catch (e) {}
            }
            const url = SERVER_URL.replace('127.0.0.1', 'localhost');
            
            // Re-render hygiene map
            if (eventSource) eventSource.close();
            eventSource = new EventSource(`${url}/projects/${projectId}/logs?token=${token}`);

            eventSource.onmessage = (event) => {
                try {
                    const logData = JSON.parse(event.data);
                    if (logData.message) {
                        logData.message = logData.message.replace(/\x1B\[[0-9;]*[mK]/g, '').trim();
                    }
                    setServerLogs(prev => [...prev.slice(-99), logData]);
                    
                    if (logData.message.includes('Writing ')) {
                        getFiles(projectId).then(res => setFiles(res.data)).catch(console.error);
                    }
                    if (logData.message.includes('Committing ')) {
                        getCommits(projectId).then(res => setCommits(res.data)).catch(console.error);
                        // NOTE: Do NOT fetch messages here — the SSE fires BEFORE MongoDB saves them,
                        // which would wipe the optimistic user message from the UI.
                        // Messages are synced from DB after sendPrompt() resolves instead.
                    }
                } catch (err) {
                    console.error("Error parsing log:", err);
                }
            };

            // Catch backend token expiry kicks so we can natively heal the socket using a fresh Firebase generation
            eventSource.onerror = () => {
                eventSource.close();
                setTimeout(initSSE, 5000); 
            };
        }; // Close initSSE

        initSSE();

        return () => {
            if (eventSource) eventSource.close();
        };
    }, [projectId, currentUser]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    // ── Server ──────────────────────────────────────────────────────────────
    const checkServerStatus = async () => {
        try {
            const { data } = await getServerStatus(projectId);
            if (data.running) setPreviewPort(data.port);
        } catch { }
    };

    const handleStartServer = async () => {
        setServerLoading(true);
        try {
            const { data } = await startDevServer(projectId);
            setPreviewPort(data.port);
        } catch (err) {
            console.error('Failed to start dev server:', err);
            alert('Failed to start dev server.');
        } finally {
            setServerLoading(false);
        }
    };

    const handleStopServer = () => setPreviewPort(null);

    // ── AI Prompt ────────────────────────────────────────────────────────────
    const handleSendPrompt = async () => {
        const text = aiInput.trim();
        if (!text || isLoading) return;
        // Optimistically add user message immediately so UI feels instant
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setAiInput('');
        setIsLoading(true);
        try {
            const { data } = await sendPrompt(projectId, text);
            // After the backend finishes, sync everything from DB (authoritative source)
            // This ensures we get the real persisted messages, not just local optimistic state
            const [filesRes, commitsRes, msgsRes] = await Promise.all([
                getFiles(projectId),
                getCommits(projectId),
                getMessages(projectId),
            ]);
            setFiles(filesRes.data);
            setCommits(commitsRes.data);
            // Use DB messages as truth — they now contain both the user + assistant messages
            if (msgsRes.data?.length > 0) setMessages(msgsRes.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${errorMsg}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Revert ───────────────────────────────────────────────────────────────
    const handleRevert = async (commitHash) => {
        if (!confirm('Revert to this commit? Current changes will be lost.')) return;
        setIsReverting(true);
        try {
            await revertToCommit(projectId, commitHash);
            await fetchProjectData();
            // Data is refreshed natively from DB, skipping volatile local state overrides!
        } catch (err) {
            alert('Failed to revert: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsReverting(false);
        }
    };

    // ── File Tabs ─────────────────────────────────────────────────────────────
    const handleFileClick = async (filePath) => {
        if (!openTabs.includes(filePath)) setOpenTabs(prev => [...prev, filePath]);
        setActiveTab(filePath);
        if (!fileContents[filePath]) {
            try {
                const pathParam = filePath.startsWith('/') ? filePath.substring(1) : filePath;
                const { data } = await getFileContent(projectId, pathParam);
                setFileContents(prev => ({ ...prev, [filePath]: data.content }));
            } catch {
                setFileContents(prev => ({ ...prev, [filePath]: '// Error loading file content' }));
            }
        }
    };

    const closeTab = (e, tab) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(t => t !== tab);
        setOpenTabs(newTabs);
        if (activeTab === tab) setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : 'preview');
    };

    const handleSaveFile = async () => {
        if (!activeTab || activeTab === 'preview') return;
        setSavingFile(true);
        try {
            const pathParam = activeTab.startsWith('/') ? activeTab.substring(1) : activeTab;
            await updateFileContent(projectId, pathParam, fileContents[activeTab]);
            const { data } = await getFiles(projectId);
            setFiles(data);
            setShowSaveNotif(true);
            setTimeout(() => setShowSaveNotif(false), 3000);
        } catch {
            alert('Failed to save file');
        } finally {
            setSavingFile(false);
        }
    };

    const toggleFolder = (key) => setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));

    const goBack = () => {
        setOverlayVisible(true);
        setTimeout(() => { navigate('/dashboard'); }, 1200);
    };

    // ── Build flat file list for search ──────────────────────────────────────
    function flattenFiles(nodes, prefix = '') {
        if (!Array.isArray(nodes)) return [];
        return nodes.flatMap(n => {
            if (n.isDirectory || n.children) return flattenFiles(n.children || [], prefix + n.name + '/');
            return [{ ...n, fullPath: prefix + n.name }];
        });
    }

    const allFiles = flattenFiles(files);
    const filteredFiles = fileSearch
        ? allFiles.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()))
        : null;

    function buildFileTree(flatFiles) {
        const root = [];
        const map = {};
        if (!Array.isArray(flatFiles)) return [];

        flatFiles.forEach(f => {
            const rawPath = f.path || f.name;
            const parts = rawPath.split('/');
            let currentLevel = root;
            let currentPath = '';

            for (let i = 0; i < parts.length; i++) {
                currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

                if (!map[currentPath]) {
                    const isLast = i === parts.length - 1;
                    const node = {
                        name: parts[i],
                        path: currentPath,
                        type: isLast && f.type === 'file' ? 'file' : 'directory',
                        children: (isLast && f.type === 'file') ? undefined : [],
                        fullPath: currentPath
                    };
                    map[currentPath] = node;
                    currentLevel.push(node);
                }

                if (map[currentPath].type === 'directory') currentLevel = map[currentPath].children;
            }
        });

        // Sort directories first
        const sortNodes = (nodes) => {
            nodes.sort((a, b) => {
                if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
            nodes.forEach(n => { if (n.children) sortNodes(n.children); });
        };
        sortNodes(root);
        return root;
    }

    if (!project) return <Loader label="Workspace" />;

    return (
        <>
            {/* Inject Styles */}
            <style>{styles}</style>

            {/* ── Google Fonts + Material Symbols ─────────────────────────── */}
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            {/* ── Dashboard Overlay ─────────────────────────────────────────── */}
            {overlayVisible && <Loader label="Dashboard" />}

            {/* ── Save Notification ─────────────────────────────────────────── */}
            <div className={`fixed top-20 right-6 z-50 pointer-events-none ws-save-notif ${showSaveNotif ? 'show' : ''}`}>
                <div className="bg-[#d8e2ff]/90 backdrop-blur-md text-[#122f5f] px-8 py-4 rounded-full font-bold text-sm shadow-2xl flex items-center gap-3" style={{ fontFamily: 'Manrope' }}>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Project Saved &amp; Commit Created
                </div>
            </div>

            <div className={`overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#131315] text-[#e5e1e4]' : 'ws-light bg-[#F8FAFC] text-[#1E293B]'}`} style={{ height: '100vh', fontFamily: 'Inter' }}>

                {/* ── TopAppBar ──────────────────────────────────────────────── */}
                <header className="bg-[#131315]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button className="p-1 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center" onClick={goBack}>
                            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                        </button>
                        <button
                            className="cursor-pointer hover:opacity-85 hover:scale-105 transition-all duration-300"
                            onClick={() => navigate('/')}
                            title="Go to Home"
                        >
                            <img
                                src={isDark
                                    ? 'https://i.postimg.cc/8z7j15Yw/Dark_Logo.png'
                                    : 'https://i.postimg.cc/T3KpRws9/Light_Logo.png'
                                }
                                alt="Nirmana Logo"
                                className="h-8 w-auto object-contain"
                            />
                        </button>
                        {project && (
                            <span className="text-slate-500 text-sm hidden md:block">/ {project.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-4">
                            <button className="text-slate-400 hover:text-[#adc6ff] transition-all text-sm px-2 py-1" style={{ fontFamily: 'Inter' }}>Collaborate</button>
                            <button className="text-slate-400 hover:text-[#adc6ff] transition-all text-sm px-2 py-1" style={{ fontFamily: 'Inter' }}>Insights</button>
                        </nav>
                        {/* Theme Toggle */}
                        <button
                            className="p-2 rounded-full hover:bg-white/5 transition-colors"
                            onClick={() => setIsDark(prev => !prev)}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <span className="material-symbols-outlined text-[#c4c6d0]">
                                {isDark ? 'dark_mode' : 'light_mode'}
                            </span>
                        </button>
                        <button
                            className="ws-premium-btn ws-btn-save text-[#d8e2ff] px-6 py-1.5 rounded-full font-bold text-xs tracking-widest transition-all"
                            style={{ fontFamily: 'Manrope' }}
                            onClick={handleSaveFile}
                            disabled={savingFile || activeTab === 'preview'}
                        >
                            {savingFile ? 'SAVING...' : 'SAVE'}
                        </button>
                        <button className="ws-premium-btn ws-btn-deploy text-[#122f5f] px-6 py-1.5 rounded-full font-bold text-xs tracking-widest transition-all" style={{ fontFamily: 'Manrope' }}>
                            DEPLOY
                        </button>
                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 text-slate-400 hover:text-white hover:border-red-400/50 hover:bg-red-500/10 transition-all duration-300"
                            style={{ fontFamily: 'Manrope' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>logout</span>
                            Log Out
                        </button>
                    </div>
                </header>

                {/* ── Main Layout ───────────────────────────────────────────── */}
                <main className="flex flex-1 pt-16 overflow-hidden" style={{ height: '100vh' }}>

                    {/* ── Left Sidebar ──────────────────────────────────────── */}
                    <aside id="ws-sidebar" className="bg-[#0E0E10]/90 backdrop-blur-2xl h-full w-64 hidden lg:flex flex-col border-r border-white/5 transition-all duration-300">
                        {/* User info */}
                        <div className="p-4 flex items-center gap-3 border-b border-white/5 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d8e2ff] to-[#e9b3ff] p-[1px] flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-[#131315] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-[#d8e2ff]">person</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#adc6ff]">
                                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Creator'}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ethereal Mode</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="px-4 py-2">
                            <div className="ws-search-container flex items-center gap-2 bg-[#0e0e10]/50 border border-white/10 rounded-xl px-3 py-2.5 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-500">search</span>
                                <input
                                    className="ws-search-input bg-transparent border-none text-xs text-[#e5e1e4] w-full p-0 font-medium outline-none"
                                    placeholder="Search files..."
                                    value={fileSearch}
                                    onChange={e => setFileSearch(e.target.value)}
                                    style={{ color: isDark ? '#e5e1e4' : '#0F172A' }}
                                />
                            </div>
                        </div>

                        {/* Explorer button */}
                        <nav className="flex flex-col gap-1 px-2 mt-2">
                            <button className="flex items-center gap-3 p-3 rounded-xl text-[#adc6ff] bg-[#adc6ff]/10 border-r-4 border-[#adc6ff]">
                                <span className="material-symbols-outlined text-xl">folder_open</span>
                                <span className="text-sm font-semibold" style={{ fontFamily: 'Inter' }}>Explorer</span>
                            </button>
                        </nav>

                        {/* File Tree */}
                        <div className="mt-4 px-4 flex-1 overflow-y-auto ws-scrollbar">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Project Files</p>
                            {filteredFiles ? (
                                <div className="space-y-1">
                                    {filteredFiles.map((f, i) => {
                                        const { icon, color } = getFileIcon(f.name);
                                        return (
                                            <button key={i}
                                                className="flex items-center gap-2 text-sm text-slate-400 py-1 w-full text-left hover:text-[#adc6ff] transition-colors"
                                                onClick={() => handleFileClick(f.path || f.fullPath || f.name)}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
                                                <span className="text-xs">{f.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {buildFileTree(files).map((node, i) => (
                                        <FileNode key={i} node={node} depth={0}
                                            onFileClick={handleFileClick}
                                            openFolders={openFolders}
                                            toggleFolder={toggleFolder} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ── Editor Canvas ─────────────────────────────────────── */}
                    <section id="ws-editor-canvas" className="flex-1 flex flex-col bg-[#131315] overflow-hidden relative transition-all duration-300">
                        {/* Tabs Bar */}
                        <div id="ws-tabs-bar" className="flex items-center bg-[#0e0e10]/50 border-b border-white/5 h-10">
                            {/* Preview tab always first */}
                            <button
                                className={`flex items-center gap-2 px-6 h-full border-r border-white/5 text-xs font-semibold transition-all min-w-[140px] ws-tab-${activeTab === 'preview' ? 'active' : 'inactive'}`}
                                onClick={() => setActiveTab('preview')}
                                style={{ fontFamily: 'Manrope' }}
                            >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                <span>Preview</span>
                            </button>
                            {openTabs.filter(t => t !== 'preview').map(tab => {
                                const name = tab.split('/').pop();
                                const { icon, color } = getFileIcon(name);
                                return (
                                    <button
                                        key={tab}
                                        className={`flex items-center gap-2 px-6 h-full border-r border-white/5 text-xs font-semibold transition-all min-w-[140px] relative group ws-tab-${activeTab === tab ? 'active' : 'inactive'}`}
                                        onClick={() => setActiveTab(tab)}
                                        style={{ fontFamily: 'Manrope' }}
                                    >
                                        <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
                                        <span>{name}</span>
                                        <span
                                            className="material-symbols-outlined text-[10px] absolute right-2 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                                            onClick={e => closeTab(e, tab)}
                                        >close</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 relative overflow-hidden flex flex-col">
                            {/* Preview Panel */}
                            {activeTab === 'preview' && (
                                <div className="flex-1 relative z-10 p-6">
                                    <div className="w-full h-full rounded-2xl overflow-hidden ws-glass-panel flex flex-col shadow-2xl">
                                        {/* Browser chrome */}
                                        <div className="h-10 flex items-center px-4 gap-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                            </div>
                                            <div className="flex-1 text-center text-[10px] text-slate-500 font-mono tracking-wide">
                                                {previewPort ? `${SERVER_URL}/projects/${projectId}/proxy/` : 'Preview Engine Ready'}
                                            </div>
                                            <div className="flex justify-end min-w-[80px]">
                                                {previewPort && (
                                                    <button
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[9px] font-bold tracking-widest transition-all text-red-400"
                                                        onClick={handleStopServer}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                        STOP
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Viewport */}
                                        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#131315] to-[#0E0E10] relative overflow-hidden">
                                            {previewPort ? (
                                                <iframe
                                                    className="w-full h-full border-none bg-white"
                                                    src={`${SERVER_URL}/projects/${projectId}/proxy/`}
                                                    title="Project Preview"
                                                />
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                                    <div className="w-24 h-24 bg-gradient-to-tr from-[#d8e2ff] to-[#e9b3ff] rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_40px_rgba(173,198,255,0.3)]">
                                                        <span className="material-symbols-outlined text-5xl text-[#122f5f]">auto_awesome</span>
                                                    </div>
                                                    <div className="space-y-2 text-center">
                                                        <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Manrope' }}>Visual Engine Active</h3>
                                                        <p className="text-slate-400 text-sm max-w-xs mx-auto">Initialize server for real-time cinematic rendering.</p>
                                                    </div>
                                                    <button
                                                        className="flex items-center gap-3 px-8 py-3 rounded-full text-xs font-bold tracking-widest transition-all ws-server-stopped text-white"
                                                        style={{ fontFamily: 'Manrope' }}
                                                        onClick={handleStartServer}
                                                        disabled={serverLoading}
                                                    >
                                                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                                        {serverLoading ? 'STARTING...' : 'START SERVER'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Code Editor */}
                            {activeTab !== 'preview' && activeTab && (
                                <div className="flex-1 flex flex-col bg-[#0e0e10]">
                                    <textarea
                                        className="flex-1 bg-transparent text-[#adc6ff] font-mono text-sm p-8 outline-none resize-none leading-relaxed ws-scrollbar"
                                        spellCheck={false}
                                        value={fileContents[activeTab] || ''}
                                        onChange={e => setFileContents(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                        onKeyDown={e => {
                                            if (e.key === 'Tab') {
                                                e.preventDefault();
                                                const start = e.target.selectionStart;
                                                const end = e.target.selectionEnd;
                                                const val = e.target.value;
                                                e.target.value = val.substring(0, start) + '  ' + val.substring(end);
                                                e.target.selectionStart = e.target.selectionEnd = start + 2;
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Right AI Panel ─────────────────────────────────────── */}
                    <aside id="ws-right-panel" className="w-80 h-full bg-[#1c1b1d] border-l border-white/5 flex flex-col hidden xl:flex transition-all duration-300">
                        {/* Panel Tabs Header */}
                        <div className="p-4 border-b border-white/5 flex flex-col gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                {rightTab === 'ai' ? 'AI Assistant' : rightTab === 'commits' ? 'Commits' : 'System Logs'}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center hover:scale-[1.02] ws-panel-tab-${rightTab === 'ai' ? 'active' : 'inactive'}`}
                                    onClick={() => setRightTab('ai')}
                                >
                                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                                </button>
                                <button
                                    className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center hover:scale-[1.02] ws-panel-tab-${rightTab === 'commits' ? 'active' : 'inactive'}`}
                                    onClick={() => setRightTab('commits')}
                                >
                                    <span className="material-symbols-outlined text-2xl">history</span>
                                </button>
                                <button
                                    className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center hover:scale-[1.02] ws-panel-tab-${rightTab === 'logs' ? 'active' : 'inactive'}`}
                                    onClick={() => setRightTab('logs')}
                                >
                                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                                </button>
                            </div>
                        </div>

                        {/* AI Chat Panel */}
                        {rightTab === 'ai' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm ws-scrollbar">
                                    {messages.map((msg, i) => (
                                        msg.role === 'assistant' ? (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-6 h-6 mt-1 rounded-full bg-[#d8e2ff]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-xs text-[#d8e2ff] ws-ai-logo-icon">auto_awesome</span>
                                                </div>
                                                <div className="ws-ai-msg p-4 rounded-2xl rounded-tl-none text-[#e5e1e4] whitespace-pre-wrap text-xs leading-relaxed">
                                                    {msg.content}
                                                    {isLoading && i === messages.length - 1 && (
                                                        <span className="inline-block w-2 h-2 bg-[#adc6ff] rounded-full animate-pulse ml-1" />
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={i} className="flex gap-3 justify-end">
                                                <div className="bg-[#d8e2ff] text-[#122f5f] p-4 rounded-2xl rounded-tr-none text-xs leading-relaxed font-medium max-w-[85%]">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 mt-1 rounded-full bg-[#d8e2ff]/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-xs text-[#d8e2ff]">auto_awesome</span>
                                            </div>
                                            <div className="ws-ai-msg p-4 rounded-2xl rounded-tl-none">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-[#adc6ff] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-[#adc6ff] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-[#adc6ff] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-white/5">
                                    <div className="relative">
                                        <textarea
                                            className={`ws-ai-input w-full bg-[#0e0e10] border rounded-xl px-4 py-4 text-sm outline-none transition-all resize-none pr-12 ws-scrollbar ${
                                                isLoading
                                                    ? 'border-[#adc6ff]/30 text-slate-600 cursor-not-allowed'
                                                    : 'border-white/10 text-[#e5e1e4]'
                                            }`}
                                            placeholder={isLoading ? 'AI is thinking... please wait' : 'Ask AI Architect...'}
                                            rows={2}
                                            value={aiInput}
                                            disabled={isLoading}
                                            onChange={e => setAiInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }}
                                            style={{ fontFamily: 'Inter' }}
                                        />
                                        <button
                                            className="absolute right-3 bottom-4 text-[#d8e2ff] hover:scale-110 transition-transform"
                                            onClick={handleSendPrompt}
                                            disabled={isLoading}
                                        >
                                            <span className="material-symbols-outlined">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Commits Panel */}
                        {rightTab === 'commits' && (
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto ws-scrollbar">
                                {commits.length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center mt-8">No commits yet.</p>
                                ) : (
                                    commits.map((commit, i) => (
                                        <div key={i} className="ws-commit-item p-4 rounded-xl flex justify-between items-center group">
                                            <div>
                                                <p className="ws-commit-title text-sm font-bold text-[#d8e2ff]">{commit.message || 'Commit'}</p>
                                                <p className="text-xs text-slate-500">{new Date(commit.date || commit.createdAt).toLocaleString()} • {commit.commitHash?.substring(0, 6)}</p>
                                            </div>
                                            <button
                                                className="ws-btn-revert px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold transition-colors"
                                                onClick={() => handleRevert(commit.commitHash)}
                                                disabled={isReverting}
                                                style={{ fontFamily: 'Manrope' }}
                                            >
                                                {isReverting ? '...' : (i === 0 ? 'RESET' : 'REVERT')}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Logs Panel */}
                        {rightTab === 'logs' && (
                            <div className="flex-1 p-4 font-mono text-[10px] text-slate-500 overflow-y-auto ws-scrollbar space-y-1">
                                {serverLogs.length === 0 ? (
                                    <p className="text-center text-slate-600 mt-8">Waiting for engine logs...</p>
                                ) : (
                                    serverLogs.map((log, i) => (
                                        <p key={i} className="mb-2.5 leading-relaxed">
                                            <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            <span className={`ml-2 ${log.level === 'error' ? 'text-red-500' : (isDark ? 'text-[#d8e2ff]/70' : 'text-slate-800')}`}>
                                                {log.message}
                                            </span>
                                        </p>
                                    ))
                                )}
                            </div>
                        )}
                    </aside>
                </main>

                {/* ── Mobile Bottom Nav ──────────────────────────────────────── */}
                <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 z-50 bg-[#131315]/40 backdrop-blur-md rounded-full px-8 py-3 border border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.3)]">
                    <span className="material-symbols-outlined text-[#e9b3ff]" style={{ filter: 'drop-shadow(0 0 5px rgba(233,179,255,0.6))' }}>terminal</span>
                    <span className="material-symbols-outlined text-slate-500">bug_report</span>
                    <span className="material-symbols-outlined text-slate-500">grid_view</span>
                    <span className="material-symbols-outlined text-slate-500">settings</span>
                </nav>
            </div>
        </>
    );
}

export default Workspace;
