"use client";

import { useState, useMemo } from "react";
import {
    attendanceRecords,
    students,
    subjects,
    getAbsenteesForDate,
    getAttendanceBySubject,
    getLabSkippers,
    getSemesterEligibility,
    ATTENDANCE_THRESHOLD,
    getStudentById,
    getSubjectById,
    type StudentEligibility,
} from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    AlertTriangle,
    Calendar,
    BookOpen,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
} from "lucide-react";

const COLORS = ["oklch(0.55 0.18 160)", "oklch(0.55 0.22 25)", "oklch(0.75 0.15 70)"];

export default function HODAttendancePage() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [searchStudent, setSearchStudent] = useState<string>("");

    // Day-wise data
    const dayWiseAbsentees = useMemo(() => {
        return getAbsenteesForDate(selectedDate);
    }, [selectedDate]);

    const dayWiseStats = useMemo(() => {
        const allRecords = attendanceRecords.filter((r) => r.date === selectedDate);
        return {
            totalRecords: allRecords.length,
            present: allRecords.filter((r) => r.status === "present").length,
            absent: allRecords.filter((r) => r.status === "absent").length,
            late: allRecords.filter((r) => r.status === "late").length,
        };
    }, [selectedDate]);

    // Subject-wise data
    const subjectWiseStats = useMemo(() => {
        return getAttendanceBySubject();
    }, []);

    const filteredSubjectStats = useMemo(() => {
        if (!selectedSubject) return subjectWiseStats;
        return subjectWiseStats.filter((s) => s.subjectId === selectedSubject);
    }, [selectedSubject, subjectWiseStats]);

    // Lab skippers
    const labSkippers = useMemo(() => {
        return getLabSkippers();
    }, []);

    // Semester-wise data
    const semesterEligibility = useMemo(() => {
        return getSemesterEligibility();
    }, []);

    const eligibilityStats = useMemo(() => {
        const eligible = semesterEligibility.filter((s) => s.overallEligible).length;
        const atRisk = semesterEligibility.filter((s) => s.eligibilityStatus === "At Risk").length;
        const ineligible = semesterEligibility.filter((s) => s.eligibilityStatus === "Ineligible").length;

        return {
            eligible,
            atRisk,
            ineligible,
            total: semesterEligibility.length,
        };
    }, [semesterEligibility]);

    const filteredEligibility = useMemo(() => {
        if (!searchStudent) return semesterEligibility;
        return semesterEligibility.filter((s) =>
            s.studentName.toLowerCase().includes(searchStudent.toLowerCase())
        );
    }, [searchStudent, semesterEligibility]);

    // Chart data
    const dayWiseChartData = useMemo(() => {
        return [
            { name: "Present", value: dayWiseStats.present },
            { name: "Absent", value: dayWiseStats.absent },
            { name: "Late", value: dayWiseStats.late },
        ];
    }, [dayWiseStats]);

    const subjectOverviewData = useMemo(() => {
        return subjectWiseStats.map((s) => {
            const avgAttendance =
                s.studentStats.length > 0
                    ? Math.round(s.studentStats.reduce((sum, st) => sum + st.percentage, 0) / s.studentStats.length)
                    : 0;
            return {
                name: s.subjectName.substring(0, 12),
                average: avgAttendance,
            };
        });
    }, [subjectWiseStats]);

    const eligibilityChartData = useMemo(() => {
        return [
            { name: "Eligible", value: eligibilityStats.eligible },
            { name: "At Risk", value: eligibilityStats.atRisk },
            { name: "Ineligible", value: eligibilityStats.ineligible },
        ];
    }, [eligibilityStats]);

    return (
        <div className="min-h-screen bg-background">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Attendance Reports</h1>
                            <p className="text-muted-foreground">
                                Multi-dimensional attendance analytics and reporting
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="day-wise" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="day-wise">
                            <Calendar className="w-4 h-4 mr-2" />
                            Day-wise
                        </TabsTrigger>
                        <TabsTrigger value="subject-wise">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Subject-wise
                        </TabsTrigger>
                        <TabsTrigger value="semester-wise">
                            <Users className="w-4 h-4 mr-2" />
                            Semester-wise
                        </TabsTrigger>
                    </TabsList>

                    {/* DAY-WISE TAB */}
                    <TabsContent value="day-wise" className="space-y-6">
                        {/* Date Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Select Date
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full md:w-64"
                                />
                            </CardContent>
                        </Card>

                        {/* Day-wise Overview Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Classes</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {dayWiseStats.totalRecords}
                                            </p>
                                        </div>
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Present</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {dayWiseStats.present}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Absent</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {dayWiseStats.absent}
                                            </p>
                                        </div>
                                        <XCircle className="w-8 h-8 text-destructive dark:text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Late</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {dayWiseStats.late}
                                            </p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Attendance Distribution Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={dayWiseChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {dayWiseChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Absentees List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Absentees on {new Date(selectedDate).toLocaleDateString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {dayWiseAbsentees.length === 0 ? (
                                    <p className="text-muted-foreground">No absences recorded for this date</p>
                                ) : (
                                    <div className="space-y-3">
                                        {dayWiseAbsentees.map((item) => (
                                            <div
                                                key={item.student.id}
                                                className="flex justify-between items-center p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium text-foreground">{item.student.name}</p>
                                                    <p className="text-sm text-muted-foreground">Roll: {item.student.rollNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-destructive dark:text-red-500">
                                                        {item.records.length} class{item.records.length > 1 ? "es" : ""}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.records.map((r) => getSubjectById(r.subjectId)?.shortName).join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SUBJECT-WISE TAB */}
                    <TabsContent value="subject-wise" className="space-y-6">
                        {/* Subject Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Select Subject
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full md:w-80 px-3 py-2 border rounded-md bg-background text-foreground"
                                >
                                    <option value="">All Subjects</option>
                                    {subjectWiseStats.map((s) => (
                                        <option key={s.subjectId} value={s.subjectId}>
                                            {s.subjectName}
                                        </option>
                                    ))}
                                </select>
                            </CardContent>
                        </Card>

                        {/* Subject Overview Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Average Attendance by Subject</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={subjectOverviewData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar
                                            dataKey="average"
                                            fill="oklch(0.55 0.18 160)"
                                            name="Avg Attendance %"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Lab Skippers Alert */}
                        <Card className="border-destructive/20">
                            <CardHeader className="bg-destructive/5 dark:bg-destructive/10">
                                <CardTitle className="text-destructive dark:text-red-500 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Lab/Practical Skippers
                                </CardTitle>
                                <CardDescription className="text-destructive/70 dark:text-red-400">
                                    Students with attendance below {ATTENDANCE_THRESHOLD}% in labs
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {labSkippers.length === 0 ? (
                                    <p className="text-muted-foreground">No lab skippers detected</p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {labSkippers.map((skipper, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 border-l-4 border-destructive/40 bg-destructive/5 dark:bg-destructive/10 rounded"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-foreground">{skipper.student.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {skipper.subject.name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-destructive dark:text-red-500">
                                                            {skipper.attendancePercentage}%
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {skipper.missedClasses} classes missed
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subject Detailed Stats */}
                        {filteredSubjectStats.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {selectedSubject
                                            ? getSubjectById(selectedSubject)?.name
                                            : "All Subjects"} - Student Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredSubjectStats[0].studentStats
                                            .sort((a, b) => a.percentage - b.percentage)
                                            .map((stat) => (
                                                <div
                                                    key={stat.studentId}
                                                    className="flex justify-between items-center p-3 border rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-foreground">{stat.studentName}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge variant="outline">P: {stat.present}</Badge>
                                                            <Badge variant="outline">A: {stat.absent}</Badge>
                                                            <Badge variant="outline">L: {stat.late}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p
                                                            className={`text-lg font-bold ${stat.percentage >= 75
                                                                    ? "text-emerald-600 dark:text-emerald-500"
                                                                    : "text-destructive dark:text-red-500"
                                                                }`}
                                                        >
                                                            {stat.percentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* SEMESTER-WISE TAB */}
                    <TabsContent value="semester-wise" className="space-y-6">
                        {/* Search Student */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Search Student
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="Search by student name..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    className="w-full"
                                />
                            </CardContent>
                        </Card>

                        {/* Eligibility Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Students</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {eligibilityStats.total}
                                            </p>
                                        </div>
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Eligible</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {eligibilityStats.eligible}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">At Risk</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {eligibilityStats.atRisk}
                                            </p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ineligible</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {eligibilityStats.ineligible}
                                            </p>
                                        </div>
                                        <XCircle className="w-8 h-8 text-destructive dark:text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Eligibility Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Eligibility Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={eligibilityChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {eligibilityChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Eligibility Details Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exam Eligibility Report</CardTitle>
                                <CardDescription>
                                    75% attendance required per subject. {filteredEligibility.length} student
                                    {filteredEligibility.length !== 1 ? "s" : ""}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {filteredEligibility.map((student) => (
                                        <div
                                            key={student.studentId}
                                            className="p-4 border rounded-lg"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-lg text-foreground">{student.studentName}</p>
                                                    <p className="text-sm text-muted-foreground">ID: {student.studentId}</p>
                                                </div>
                                                <Badge
                                                    className={
                                                        student.eligibilityStatus === "Eligible"
                                                            ? "bg-emerald-600 dark:bg-emerald-700 text-white"
                                                            : student.eligibilityStatus === "At Risk"
                                                                ? "bg-yellow-600 dark:bg-yellow-700 text-white"
                                                                : "bg-destructive dark:bg-red-700 text-white"
                                                    }
                                                >
                                                    {student.eligibilityStatus}
                                                </Badge>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Overall Attendance:{" "}
                                                    <span
                                                        className={`font-bold ${student.totalAttendance >= 75
                                                                ? "text-emerald-600 dark:text-emerald-500"
                                                                : "text-destructive dark:text-red-500"
                                                            }`}
                                                    >
                                                        {student.totalAttendance}%
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Subject breakdown */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {student.bySubject.map((subj) => (
                                                    <div
                                                        key={subj.subjectId}
                                                        className={`p-2 rounded text-sm border ${subj.isEligible
                                                                ? "border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-700/30 dark:bg-emerald-950/20"
                                                                : "border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between">
                                                            <span className="text-foreground text-xs font-medium">
                                                                {subj.subjectName.substring(0, 20)}
                                                            </span>
                                                            <span
                                                                className={`font-bold text-xs ${subj.isEligible
                                                                        ? "text-emerald-600 dark:text-emerald-500"
                                                                        : "text-destructive dark:text-red-500"
                                                                    }`}
                                                            >
                                                                {subj.attendance}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
