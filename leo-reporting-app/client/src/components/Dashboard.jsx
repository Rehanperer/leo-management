import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { projects, financial } from '../services/api';

function Dashboard() {
    const [projectList, setProjectList] = useState([]);
    const [financialList, setFinancialList] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, financialRes] = await Promise.all([
                projects.getAll(),
                financial.getAll()
            ]);
            setProjectList(projectsRes.data);
            setFinancialList(financialRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Leo Reporting Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-white">{user?.clubName}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Project Reports */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Project Reports</h2>
                            <Link
                                to="/project/new"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                + New Project
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {projectList.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No projects yet</p>
                            ) : (
                                projectList.map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/project/${project.id}`}
                                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <h3 className="font-semibold text-gray-800">{project.projectTitle}</h3>
                                        <p className="text-sm text-gray-600">{new Date(project.date).toLocaleDateString()}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Financial Reports */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
                            <Link
                                to="/financial/new"
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                + New Report
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {financialList.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No reports yet</p>
                            ) : (
                                financialList.map((report) => (
                                    <Link
                                        key={report.id}
                                        to={`/financial/${report.id}`}
                                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <h3 className="font-semibold text-gray-800">
                                            {new Date(report.year, report.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <p className="text-sm text-gray-600">Balance: ${report.balance}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
