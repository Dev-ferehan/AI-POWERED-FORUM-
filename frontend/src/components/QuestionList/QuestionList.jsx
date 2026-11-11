import React from 'react';
import { MessageSquare } from 'lucide-react';
import styles from './Question.module.css';
import { useNavigate } from 'react-router-dom';

function QuestionList({ questions, loading }) {

const navigate=useNavigate()
  // Helper function to get user initials from author object
  const getInitials = (author) => {
    if (!author) return 'U';
    const first = author.firstName ? author.firstName[0] : '';
    const last = author.lastName ? author.lastName[0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  // Helper function to format date/time nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(); 
  };

  return (
    <div className={`card ${styles.feedContainer} container-fluid px-3 px-md-4`}>
      {/* Header Section */}
      <div className={`${styles.feedHeader} d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4`}>
        <div>
          <h4 className={styles.feedTitle}>Discussion feed</h4>
          <p className={styles.feedSubtitle}>Your threads use a slim left accent in this list.</p>
        </div>
        <button className={`btn ${styles.newestThreadsBtn} align-self-stretch align-self-sm-auto`}>
          NEWEST THREADS
        </button>
      </div>

      {/* Feed Threads List / Loading Check */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5 gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="fw-medium">Loading Recent Questions...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center text-muted py-5 fw-medium">
          No questions found.
        </div>
      ) : (
        <div className={styles.threadList}>
          {questions?.map((question) => {
            const authorName = question.author 
              ? `${question.author.firstName || ''} ${question.author.lastName || ''}`.trim() 
              : 'Anonymous';
            
            const initials = getInitials(question.author);

            return (
              <div 
                key={question.id} 
                className={`${styles.threadItem} p-3 mb-3 
                ${question.isYours ? styles.yoursAccent : ''}`}
              >
                <div className="d-flex flex-column flex-sm-row align-items-start gap-3" onClick={()=>navigate(`/question/${question.questionHash}`)}>
                  {/* Avatar */}
                  <div 
                    className={`${styles.avatar} flex-shrink-0`}
                    style={{ backgroundColor: question.avatarBg || '#5ff9e6' }}
                  >
                    {initials}
                  </div>

                  {/* questionContent */}
                  <div className="flex-grow-1 w-100">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                      <h5 className={`${styles.threadHeading} text-break mb-0`}>{question.title}</h5>
                      {question.isYours && <span className={styles.yoursBadge}>YOURS</span>}
                    </div>

                    <p className={`${styles.threadSnippet} text-break`}>{question.content}</p>

                    {/* Footer Info */}
                    <div className={`${styles.threadFooter} d-flex flex-wrap align-items-center gap-2 text-muted small`}>
                      <span className="d-flex align-items-center gap-1">
                        <MessageSquare size={14} /> {question.answerCount || 0} replies
                      </span>
                      <span>•</span>
                      <span>{formatDate(question.createdAt)} by {authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionList;