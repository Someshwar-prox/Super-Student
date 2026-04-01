"use client";

import { useState, useEffect, useRef } from "react";
import type { Student } from "@/lib/data";
import { getStudentById } from "@/lib/data";
import {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Mail,
  FileText,
  CheckCheck,
  Printer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

type LetterType = "bonafide" | "study" | "loan" | "internship";

const letterTypeNames: Record<LetterType, string> = {
  bonafide: "Bonafide Certificate",
  study: "Study Certificate",
  loan: "Loan Estimation Letter",
  internship: "Internship Permission Letter",
};

export default function StudentNotificationsPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsed = JSON.parse(storedStudent);
      setStudent(parsed);
      loadNotifications(parsed.id);
    }
  }, []);

  const loadNotifications = (studentId: string) => {
    const notifs = getStudentNotifications(studentId);
    setNotifications(notifs);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      loadNotifications(student!.id);
    }

    if (notification.type === "letter_approved") {
      setSelectedNotification(notification);
      setShowLetterDialog(true);
    }
  };

  const handleMarkAllRead = () => {
    if (student) {
      markAllNotificationsAsRead(student.id);
      loadNotifications(student.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
    if (student) {
      loadNotifications(student.id);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownloadLetter = () => {
    if (letterRef.current) {
      const printContent = letterRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=800");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${selectedNotification?.letterType} - ${selectedNotification?.serialNumber}</title>
              <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 24px; margin: 0; }
                .header h2 { font-size: 18px; margin: 5px 0; }
                .header p { margin: 5px 0; font-size: 14px; }
                .content { margin: 30px 0; text-align: justify; }
                .signature { margin-top: 60px; text-align: right; }
                .ref-no { text-align: left; margin-bottom: 20px; }
                .serial-box { border: 1px solid #000; padding: 4px 12px; font-weight: bold; display: inline-block; }
                @media print {
                  body { margin: 0; padding: 20mm; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()">Print / Save as PDF</button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const renderApprovedLetter = () => {
    if (!student || !selectedNotification) return null;

    const letterType = selectedNotification.letterType as LetterType;
    const currentDate = getCurrentDate();
    const serialNumber = selectedNotification.serialNumber || "N/A";

    const letterContent: Record<LetterType, React.ReactElement> = {
      bonafide: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span className="serial-box">Serial No: {serialNumber}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">BONAFIDE CERTIFICATE</h3>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong> and Roll Number <strong>{student.rollNumber}</strong>,
              is a bonafide student of this department, currently pursuing <strong>{student.course}</strong> in{" "}
              <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is currently in <strong>Year {student.year}</strong>,{" "}
              <strong>Semester {student.semester}</strong> of the program. The student was admitted to this
              course on <strong>{new Date(student.dateOfAdmission).toLocaleDateString("en-IN")}</strong>.
            </p>
            <p>
              This certificate is issued upon request for whatever purpose it may serve. The student&apos;s conduct and
              character during the period of study has been found to be satisfactory.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      study: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span className="serial-box">Serial No: {serialNumber}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">STUDY CERTIFICATE</h3>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, S/o or D/o of the guardian, bearing
              Registration Number <strong>{student.regdNo}</strong>, has been studying in this institution.
            </p>
            <p className="mb-4">
              <strong>Course Details:</strong>
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Program: <strong>{student.course}</strong></li>
              <li>Branch: <strong>{student.branch}</strong></li>
              <li>Current Year: <strong>{student.year}</strong></li>
              <li>Current Semester: <strong>{student.semester}</strong></li>
              <li>Date of Admission: <strong>{new Date(student.dateOfAdmission).toLocaleDateString("en-IN")}</strong></li>
            </ul>
            <p>
              This certificate is issued for the purpose of records and verification. The above information is true to
              the best of our knowledge and records.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      loan: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span className="serial-box">Serial No: {serialNumber}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">EDUCATION LOAN ESTIMATION LETTER</h3>

          <p className="mb-4">
            To,<br />
            The Branch Manager,<br />
            [Bank Name],<br />
            [Branch Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Education Loan for {student.name} - Estimation of Expenses
          </p>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong>, is a bonafide student of this department, currently pursuing{" "}
              <strong>{student.course}</strong> in <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The estimated expenses for the course are as follows:
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Tuition Fee: <strong>As per actuals</strong></li>
              <li>Other Expenses: <strong>As per actuals</strong></li>
            </ul>
            <p>
              This letter is issued for the purpose of obtaining an educational loan.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      internship: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span className="serial-box">Serial No: {serialNumber}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">INTERNSHIP PERMISSION LETTER</h3>

          <p className="mb-4">
            To,<br />
            The HR Manager,<br />
            [Company Name],<br />
            [Company Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Permission for Internship - {student.name}
          </p>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong> and Roll Number <strong>{student.rollNumber}</strong>, is a bonafide
              student of this department, currently pursuing <strong>{student.course}</strong> in{" "}
              <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is permitted to undergo an internship program at your organization for a duration of{" "}
              <strong>[Duration]</strong>.
            </p>
            <p>
              We request you to kindly provide the necessary facilities for the internship. This letter is issued with
              the approval of the Head of the Department.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),
    };

    return letterContent[letterType] || null;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your letter requests and announcements
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{unreadCount}</div>
            <p className="text-sm text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{
              notifications.filter((n) => n.type === "letter_approved").length
            }</div>
            <p className="text-sm text-muted-foreground">Approved Letters</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">When your letter requests are approved, you'll see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    notification.read
                      ? "bg-muted/30 border-muted"
                      : "bg-amber-50 border-amber-200 hover:bg-amber-100"
                  }`}
>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        notification.type === "letter_approved"
                          ? "bg-green-100 text-green-600"
                          : notification.type === "letter_rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {notification.type === "letter_approved" && <CheckCircle2 className="h-5 w-5" />}
                      {notification.type === "letter_rejected" && <XCircle className="h-5 w-5" />}
                      {notification.type === "general" && <Mail className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="default" className="bg-amber-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {notification.type === "letter_approved" && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <FileText className="h-3 w-3 mr-1" />
                            Click to download
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Serial: {notification.serialNumber}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.type === "letter_approved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Letter Download Dialog */}
      <Dialog open={showLetterDialog} onOpenChange={setShowLetterDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Approved Letter</DialogTitle>
            <DialogDescription>
              {selectedNotification && (
                <span>
                  {letterTypeNames[selectedNotification.letterType as LetterType]} -{" "}
                  Serial: {selectedNotification.serialNumber}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              {renderApprovedLetter()}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLetterDialog(false)}>
                Close
              </Button>
              <Button onClick={handleDownloadLetter}>
                <Download className="h-4 w-4 mr-2" />
                Download / Print Letter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
