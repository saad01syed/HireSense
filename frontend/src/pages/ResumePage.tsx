import { useRef, useState } from 'react'
import { IconUpload, IconCheck, IconX, IconAlert } from '../components/Icons'
import {
  uploadResume,
  type ResumeUploadResponse,
  type StructuredResumeEntry,
} from '../api/resume'
import styles from './ResumePage.module.css'

function StructuredEntrySection({
  title,
  entries,
  emptyText,
}: {
  title: string
  entries: StructuredResumeEntry[]
  emptyText: string
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.analysisSectionTitle}>{title}</div>

      {entries.length > 0 ? (
        <div className={styles.entryGroupList}>
          {entries.map((entry, index) => (
            <div key={`${entry.title}-${index}`} className={styles.entryCard}>
              <div className={styles.entryTitleCard}>
                <div className={styles.entryTitle}>{entry.title}</div>
              </div>

              {entry.bullets.length > 0 && (
                <ul className={styles.entryBullets}>
                  {entry.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={`${entry.title}-${bulletIndex}`}
                      className={styles.entryBulletCard}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMini}>{emptyText}</div>
      )}
    </section>
  )
}

function AnalysisList({
  title,
  items,
  icon,
  tone,
  emptyText,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
  tone: 'pos' | 'warn' | 'neg'
  emptyText: string
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.analysisSectionTitle}>{title}</div>

      {items.length > 0 ? (
        <ul className={styles.insightList}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className={styles.insightItem}>
              <span className={`${styles.insightIcon} ${styles[tone]}`}>{icon}</span>
              <span className={styles.insightText}>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMini}>{emptyText}</div>
      )}
    </section>
  )
}

export default function ResumePage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [uploadedAt, setUploadedAt] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resumeResult, setResumeResult] = useState<ResumeUploadResponse | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAllowedFile = (file: File) => {
    const fileName = file.name.toLowerCase()
    return fileName.endsWith('.pdf') || fileName.endsWith('.docx')
  }

  const validateFile = (file: File) => {
    if (!isAllowedFile(file)) {
      return 'Only PDF and DOCX files are allowed.'
    }

    if (file.size === 0) {
      return 'The selected file is empty.'
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'File is too large. Please upload a resume smaller than 5 MB.'
    }

    return ''
  }

  const formatTime = () => {
    return new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--green)'
    if (score >= 70) return 'var(--amber)'
    return 'var(--red)'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Strong'
    if (score >= 70) return 'Good'
    if (score >= 55) return 'Needs Work'
    return 'Weak'
  }

  const getScoreGradient = (score: number) => {
    const color = getScoreColor(score)
    return {
      background: `conic-gradient(${color} 0% ${score}%, var(--border) ${score}% 100%)`,
    }
  }

  const resetUpload = () => {
    setResumeResult(null)
    setError('')
    setSuccessMessage('')
    setSelectedFileName('')
    setUploadedAt('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSuccessMessage('')
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      setIsUploading(true)
      setSelectedFileName(file.name)

      const result = await uploadResume(file)
      setResumeResult(result)
      setUploadedAt(formatTime())
      setSuccessMessage('Resume uploaded and analyzed successfully.')
    } catch (err) {
      setResumeResult(null)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong while uploading the resume.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFileUpload(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void handleFileUpload(file)
    }
  }

  const parsed = resumeResult?.parsed_data
  const analysis = resumeResult?.analysis

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className={styles.title}>Upload Resume</h1>
        <p className={styles.subtitle}>
          Upload a PDF or DOCX resume to get a harsher technical review, structured parsing,
          and specific recommendations to improve it.
        </p>
      </div>

      <div className={styles.layout}>
        <div>
          <div
            className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''} ${
              isUploading ? styles.uploading : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click()
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className={styles.hiddenInput}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div className={styles.uploadIcon}>
              <IconUpload />
            </div>

            <h3 className={styles.uploadTitle}>
              {isUploading ? 'Analyzing your resume...' : 'Drop your resume here'}
            </h3>
            <p className={styles.uploadSub}>
              {isUploading
                ? 'We are extracting content, grading it, and generating recommendations.'
                : 'or click to browse your files'}
            </p>

            <button
              className="btn-primary"
              style={{ padding: '10px 24px' }}
              onClick={(e) => {
                e.stopPropagation()
                if (!isUploading) fileInputRef.current?.click()
              }}
              disabled={isUploading}
            >
              {isUploading ? 'Processing...' : 'Choose File'}
            </button>

            <div className={styles.uploadFormats}>Supports PDF and DOCX • Max size 5 MB</div>

            <div className={styles.uploadHelperGrid}>
              <div className={styles.helperPill}>Better scoring feedback</div>
              <div className={styles.helperPill}>Specific fix recommendations</div>
              <div className={styles.helperPill}>Structured project parsing</div>
            </div>

            {isUploading && (
              <div className={styles.statusMessage}>
                Uploading and analyzing your resume...
              </div>
            )}

            {successMessage && !isUploading && (
              <div className={`${styles.statusMessage} ${styles.successState}`}>
                {successMessage}
              </div>
            )}

            {error && (
              <div className={`${styles.statusMessage} ${styles.errorState}`}>{error}</div>
            )}
          </div>

          <div className={styles.recentCard}>
            <div className={styles.recentCardHeader}>
              <div className="section-title">Recently Uploaded</div>
              {resumeResult && (
                <button className={styles.secondaryButton} onClick={resetUpload}>
                  Upload Another
                </button>
              )}
            </div>

            {!resumeResult ? (
              <div className={styles.emptyState}>No resume uploaded yet.</div>
            ) : (
              <div className={styles.recentFile}>
                <div className={styles.recentFileBadge}>CV</div>

                <div className={styles.recentFileInfo}>
                  <div className={styles.recentFileName}>
                    {selectedFileName || resumeResult.filename}
                  </div>
                  <div className={styles.recentFileMeta}>
                    Uploaded {uploadedAt || 'just now'}
                  </div>
                </div>

                <div className={styles.recentFileStatus}>Processed</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.analysisCard}>
          <h2 className={styles.analysisTitle}>Resume Analysis</h2>

          {!resumeResult || !parsed || !analysis ? (
            <div className={styles.emptyState}>
              Upload a resume to see your score, parsed sections, major warnings, and
              targeted improvement suggestions.
            </div>
          ) : (
            <div className={styles.analysisContent}>
              <div className={styles.scoreWrap}>
                <div className={styles.scoreRing} style={getScoreGradient(analysis.score)}>
                  <span
                    className={styles.scoreNum}
                    style={{ color: getScoreColor(analysis.score) }}
                  >
                    {analysis.score}
                  </span>
                </div>

                <div className={styles.scoreMeta}>
                  <div className={styles.scoreTopRow}>
                    <div className={styles.scoreLabel}>Overall Resume Score</div>
                    <span className={styles.scoreBadge}>{getScoreLabel(analysis.score)}</span>
                  </div>
                  <div className={styles.scoreSub}>{analysis.summary}</div>
                </div>
              </div>

              <div className={styles.snapshotGrid}>
                <div className={styles.snapshotCard}>
                  <div className={styles.snapshotValue}>{parsed.skills.length}</div>
                  <div className={styles.snapshotLabel}>Skills Found</div>
                </div>
                <div className={styles.snapshotCard}>
                  <div className={styles.snapshotValue}>{parsed.experience_entries.length}</div>
                  <div className={styles.snapshotLabel}>Experience Entries</div>
                </div>
                <div className={styles.snapshotCard}>
                  <div className={styles.snapshotValue}>{parsed.project_entries.length}</div>
                  <div className={styles.snapshotLabel}>Project Entries</div>
                </div>
                <div className={styles.snapshotCard}>
                  <div className={styles.snapshotValue}>{analysis.warnings.length}</div>
                  <div className={styles.snapshotLabel}>Major Warnings</div>
                </div>
              </div>

              <section className={styles.sectionCard}>
                <div className={styles.analysisSectionTitle}>Contact Information</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{parsed.name || 'Not found'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{parsed.email || 'Not found'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{parsed.phone || 'Not found'}</span>
                  </div>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.analysisSectionTitle}>Skills Found</div>
                {parsed.skills.length > 0 ? (
                  <div className={styles.tagsWrap}>
                    {parsed.skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className={styles.tag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyMini}>No skills found.</div>
                )}
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.analysisSectionTitle}>Education</div>
                {parsed.education.length > 0 ? (
                  <ul className={styles.detailList}>
                    {parsed.education.map((item, index) => (
                      <li key={`${item}-${index}`} className={styles.detailListItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyMini}>No education found.</div>
                )}
              </section>

              <StructuredEntrySection
                title="Experience"
                entries={parsed.experience_entries || []}
                emptyText="No experience found."
              />

              <StructuredEntrySection
                title="Projects"
                entries={parsed.project_entries || []}
                emptyText="No projects found."
              />

              <StructuredEntrySection
                title="Leadership / Professional Development"
                entries={parsed.leadership_entries || []}
                emptyText="No leadership entries found."
              />

              <div className={styles.threeColumnGrid}>
                <AnalysisList
                  title="Strengths"
                  items={analysis.strengths}
                  icon={<IconCheck />}
                  tone="pos"
                  emptyText="No strengths found."
                />

                <AnalysisList
                  title="Warnings"
                  items={analysis.warnings}
                  icon={<IconX />}
                  tone="neg"
                  emptyText="No major warnings found."
                />

                <AnalysisList
                  title="Recommended Fixes"
                  items={analysis.improvements}
                  icon={<IconAlert />}
                  tone="warn"
                  emptyText="No improvements found."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}