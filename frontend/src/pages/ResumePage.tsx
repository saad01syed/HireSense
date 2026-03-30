import { useState, useRef } from 'react'
import { IconUpload, IconCheck, IconX, IconAlert } from '../components/Icons'
import styles from './ResumePage.module.css'

// TODO: Replace with API calls — import { uploadResume, fetchLatestResume } from '../api/resume'

export default function ResumePage() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // TODO: On mount, call fetchLatestResume() to populate last uploaded resume
  // TODO: On file drop/select, call uploadResume(file) and display returned analysis

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // TODO: uploadResume(e.dataTransfer.files[0])
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className={styles.title}>Upload Resume</h1>
        <p className={styles.subtitle}>
          Get a personalized analysis and see how you match with DFW tech jobs.
        </p>
      </div>

      <div className={styles.layout}>
        {/* LEFT — Upload */}
        <div>
          <div
            className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              // TODO: onChange — call uploadResume(file)
            />
            <div className={styles.uploadIcon}>
              <IconUpload />
            </div>
            <h3 className={styles.uploadTitle}>Drop your resume here</h3>
            <p className={styles.uploadSub}>or click to browse your files</p>
            <button
              className="btn-primary"
              style={{ padding: '10px 24px' }}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Choose File
            </button>
            <div className={styles.uploadFormats}>
              Supports PDF, DOCX, TXT — max 5MB
            </div>
          </div>

          {/* Recently uploaded — TODO: populate from fetchLatestResume() */}
          <div className={styles.recentCard}>
            <div className="section-title">Recently Uploaded</div>
            <div className={styles.emptyState}>
              No resume uploaded yet.
            </div>
          </div>
        </div>

        {/* RIGHT — Analysis — TODO: populate from uploadResume() response */}
        <div className={styles.analysisCard}>
          <h2 className={styles.analysisTitle}>Resume Analysis</h2>
          <div className={styles.emptyState}>
            Upload a resume to see your analysis, skill scores, and personalized insights.
          </div>
        </div>
      </div>
    </div>
  )
}
