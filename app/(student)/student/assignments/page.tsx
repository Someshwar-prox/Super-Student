"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Award, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { assignments, subjects, type Assignment } from "@/lib/data";

export default function StudentAssignmentsPage() {
  const [assignmentList] = useState<Assignment[]>(assignments);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  const getSubjectCode = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.code || subjectId;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeAssignments = assignmentList.filter(a => a.status === "active");
  const closedAssignments = assignmentList.filter(a => a.status === "closed");

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Assignments</h1>
          <p className="text-muted-foreground">
            View and track your assignments
          </p>
        </div>
      </div>

      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Active Assignments
            <Badge variant="secondary">{activeAssignments.length}</Badge>
          </CardTitle>
          <CardDescription>
            Currently open assignments that need to be submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length > 0 ? (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`p-4 border rounded-lg ${
                    isOverdue(assignment.dueDate)
                      ? "border-destructive bg-destructive/5"
                      : "border-border hover:bg-muted/50"
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{assignment.title}</span>
                        <Badge variant="secondary">{getSubjectCode(assignment.subjectId)}</Badge>
                        {isOverdue(assignment.dueDate) ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getSubjectName(assignment.subjectId)}
                      </p>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {assignment.maxMarks} marks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active assignments</p>
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closed Assignments */}
      {closedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Completed Assignments
              <Badge variant="secondary">{closedAssignments.length}</Badge>
            </CardTitle>
            <CardDescription>
              Past assignments that are now closed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {closedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-muted-foreground">{assignment.title}</span>
                        <Badge variant="secondary">{getSubjectCode(assignment.subjectId)}</Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getSubjectName(assignment.subjectId)}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {assignment.maxMarks} marks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created: {formatDate(assignment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
