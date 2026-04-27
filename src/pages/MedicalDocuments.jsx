// @ts-ignore
import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Download, ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const docTypeLabels = {
  blood_test: '🩸 Blood Test',
  hba1c: '📊 HbA1c',
  urine_test: '🧪 Urine Test',
  prescription: '💊 Prescription',
  scan: '🖥️ Scan / Imaging',
  other: '📄 Other',
};

const docTypeColors = {
  blood_test: 'from-red-400 to-rose-500',
  hba1c: 'from-blue-400 to-indigo-500',
  urine_test: 'from-yellow-400 to-amber-500',
  prescription: 'from-green-400 to-emerald-500',
  scan: 'from-purple-400 to-violet-500',
  other: 'from-slate-400 to-slate-500',
};

export default function MedicalDocuments() {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ document_type: '', notes: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const viewingChild = urlParams.get('child');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    // @ts-ignore
    queryFn: () => base44.entities.User.list(),
    // @ts-ignore
    enabled: !!user?.email,
  });

  // Doctor/parent can view any child they have linked; child views own docs
  // @ts-ignore
  const role = user?.role || 'child';
  const linkedChildren = role === 'doctor'
    // @ts-ignore
    ? (allUsers.find(u => u.email === user?.email)?.linked_child_emails || [])
    : role === 'parent'
    // @ts-ignore
    ? (allUsers.find(u => u.email === user?.email)?.linked_children || [])
    : [];

  const [selectedChildEmail, setSelectedChildEmail] = useState('');
  const targetEmail = (role !== 'child')
    // @ts-ignore
    ? (viewingChild || selectedChildEmail || linkedChildren[0] || user?.email)
    // @ts-ignore
    : user?.email;
  const isViewer = role !== 'child';

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['medicalDocs', targetEmail],
    // @ts-ignore
    queryFn: () => base44.entities.MedicalDocument.filter({ user_email: targetEmail }, '-upload_date', 50),
    enabled: !!targetEmail,
  });

  const deleteMutation = useMutation({
    // @ts-ignore
    mutationFn: (id) => base44.entities.MedicalDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalDocs'] });
      toast.success('Document deleted');
    },
  });

  // @ts-ignore
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    try {
      // @ts-ignore
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      // @ts-ignore
      await base44.entities.MedicalDocument.create({
        // @ts-ignore
        user_email: user.email,
        file_url,
        // @ts-ignore
        file_name: selectedFile.name,
        document_type: form.document_type || 'other',
        notes: form.notes || undefined,
        upload_date: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['medicalDocs'] });
      toast.success('Document uploaded! 📄');
      setShowForm(false);
      setSelectedFile(null);
      setForm({ document_type: '', notes: '' });
    } catch (err) {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const backPath = role === 'doctor' ? '/DoctorDashboard' : role === 'parent' ? '/ParentDashboard' : '/ChildDashboard';

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={backPath}>
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">📁 Medical Documents</h1>
          {isViewer && <p className="text-xs text-slate-400">Viewing: {targetEmail}</p>}
        </div>
        {!isViewer && (
          <
// @ts-ignore
          Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" /> Upload
          </Button>
        )}
      </div>

      {/* Child selector for doctors/parents */}
      {isViewer && linkedChildren.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {linkedChildren.map(
// @ts-ignore
          em => (
            <button
              key={em}
              onClick={() => setSelectedChildEmail(em)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                targetEmail === em
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-teal-50'
              }`}
            >
              🧒 {allUsers.find(
// @ts-ignore
              u => u.email === em)?.full_name || em}
            </button>
          ))}
        </div>
      )}

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm"
          >
            <h2 className="font-bold text-slate-800">Upload New Document</h2>

            <div
              // @ts-ignore
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-teal-200 rounded-xl p-6 text-center cursor-pointer hover:bg-teal-50 transition-colors"
            >
              {selectedFile ? (
                <div>
                  <FileText className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                  <p className="font-medium text-slate-700 text-sm">{selectedFile.
// @ts-ignore
                  name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.
// @ts-ignore
                  size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tap to select a file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG supported</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-2">
              <
// @ts-ignore
              Label>Document Type</Label>
              <Select value={form.document_type} onValueChange={v => setForm(f => ({ ...f, document_type: v }))}>
                <
// @ts-ignore
                SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <
// @ts-ignore
                SelectContent>
                  {Object.entries(docTypeLabels).map(([val, label]) => (
                    <
// @ts-ignore
                    SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <
// @ts-ignore
              Label>Notes (optional)</Label>
              <Textarea
                // @ts-ignore
                placeholder="e.g. HbA1c from April 2026..."
                value={form.notes}
                // @ts-ignore
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="rounded-xl"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <
// @ts-ignore
              Button
                variant="outline"
                onClick={() => { setShowForm(false); setSelectedFile(null); }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <
// @ts-ignore
              Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No documents yet</p>
          {!isViewer && <p className="text-xs mt-1">Upload your test reports and prescriptions</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(
// @ts-ignore
          doc => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
// @ts-ignore
              docTypeColors[doc.document_type] || docTypeColors.other} flex items-center justify-center shrink-0 shadow-md`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{doc.file_name}</p>
                <p className="text-xs text-slate-400">{
// @ts-ignore
                docTypeLabels[doc.document_type] || '📄 Other'}</p>
                {doc.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.notes}</p>}
                <p className="text-xs text-slate-300 mt-0.5">{format(new Date(doc.upload_date), 'dd MMM yyyy')}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <button className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors">
                    <Eye className="w-4 h-4 text-teal-600" />
                  </button>
                </a>
                <a href={doc.file_url} download={doc.file_name} target="_blank" rel="noopener noreferrer">
                  <button className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </a>
                {!isViewer && (
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}