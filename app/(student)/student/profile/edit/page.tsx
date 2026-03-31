"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  ArrowLeft,
  Camera,
  Save,
  Lock,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type Student } from "@/lib/data";

export default function EditProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parentPhone: "",
    dateOfBirth: "",
    photo: "",
  });

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);
      setFormData({
        name: parsedStudent.name || "",
        email: parsedStudent.email || "",
        phone: parsedStudent.phone || "",
        parentPhone: parsedStudent.parentPhone || "",
        dateOfBirth: parsedStudent.dateOfBirth || "",
        photo: parsedStudent.photo || "",
      });
      setPreviewPhoto(parsedStudent.photo || null);
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Photo size must be less than 2MB" });
        return;
      }
      // Check file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please upload an image file" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewPhoto(base64String);
        setFormData((prev) => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPreviewPhoto(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (student) {
      // Update student data (keeping regdNo and rollNumber unchanged)
      const updatedStudent: Student = {
        ...student,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        parentPhone: formData.parentPhone,
        dateOfBirth: formData.dateOfBirth,
        photo: formData.photo,
      };

      // Save to sessionStorage
      sessionStorage.setItem("studentUser", JSON.stringify(updatedStudent));
      setStudent(updatedStudent);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 lg:p-6">
        <Alert variant="destructive">
          <AlertDescription>Student data not found. Please login again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information
          </p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Photo
            </CardTitle>
            <CardDescription>
              Upload a profile picture (max 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Photo Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {previewPhoto ? (
                    <Image
                      src={previewPhoto}
                      alt="Profile preview"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {formData.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                {previewPhoto && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-8 w-8 rounded-full"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Photo Upload Buttons */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={handlePhotoClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <Separator />

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update your email and phone numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <Separator />

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <Separator />

            {/* Parent Phone */}
            <div className="space-y-2">
              <Label htmlFor="parentPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Parent&apos;s Phone Number
              </Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={handleInputChange}
                placeholder="Enter parent's phone number"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Academic Information
            </CardTitle>
            <CardDescription>
              These fields cannot be edited
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={student.regdNo} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Roll Number</Label>
                <Input value={student.rollNumber} disabled className="bg-muted" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={student.course} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input value={student.branch} disabled className="bg-muted" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={`${student.year}rd Year`} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input value={`Semester ${student.semester}`} disabled className="bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/student/profile">
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
