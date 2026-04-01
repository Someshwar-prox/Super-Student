"use client";

// Assignment submission interface
export interface AssignmentSubmission {
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  content: string;
  status: "submitted" | "graded" | "faculty-marked";
  marks?: number;
  markedByFaculty?: boolean;
  markedByFacultyId?: string;
  markedByFacultyName?: string;
  facultyRemark?: string;
}

const SUBMISSIONS_KEY = "assignment_submissions";

// Get all submissions from localStorage
export function getSubmissions(): AssignmentSubmission[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SUBMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save submissions to localStorage
export function saveSubmissions(submissions: AssignmentSubmission[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

// Check if a student has submitted an assignment
export function hasStudentSubmitted(assignmentId: string, studentId: string): boolean {
  const submissions = getSubmissions();
  return submissions.some(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
}

// Get submission for a student
export function getStudentSubmission(
  assignmentId: string,
  studentId: string
): AssignmentSubmission | null {
  const submissions = getSubmissions();
  return (
    submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    ) || null
  );
}

// Faculty marks assignment as submitted for a student
export function markAssignmentAsSubmitted(
  assignmentId: string,
  studentId: string,
  facultyId: string,
  facultyName: string,
  remark?: string
): void {
  const submissions = getSubmissions();

  // Check if already exists
  const existingIndex = submissions.findIndex(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );

  const newSubmission: AssignmentSubmission = {
    assignmentId,
    studentId,
    submittedAt: new Date().toISOString(),
    content: remark || "Marked as submitted by faculty",
    status: "faculty-marked",
    markedByFaculty: true,
    markedByFacultyId: facultyId,
    markedByFacultyName: facultyName,
    facultyRemark: remark,
  };

  if (existingIndex >= 0) {
    // Update existing
    submissions[existingIndex] = {
      ...submissions[existingIndex],
      ...newSubmission,
    };
  } else {
    // Add new
    submissions.push(newSubmission);
  }

  saveSubmissions(submissions);
}

// Faculty unmarks/removes submission for a student
export function unmarkAssignmentAsSubmitted(
  assignmentId: string,
  studentId: string
): void {
  const submissions = getSubmissions();
  const filtered = submissions.filter(
    (s) => !(s.assignmentId === assignmentId && s.studentId === studentId)
  );
  saveSubmissions(filtered);
}

// Get all submissions for an assignment
export function getAssignmentSubmissions(assignmentId: string): AssignmentSubmission[] {
  const submissions = getSubmissions();
  return submissions.filter((s) => s.assignmentId === assignmentId);
}

// Get submission stats for an assignment
export function getAssignmentSubmissionStats(assignmentId: string, totalStudents: number) {
  const submissions = getAssignmentSubmissions(assignmentId);
  return {
    submitted: submissions.length,
    notSubmitted: totalStudents - submissions.length,
    percentage: totalStudents > 0 ? Math.round((submissions.length / totalStudents) * 100) : 0,
  };
}
