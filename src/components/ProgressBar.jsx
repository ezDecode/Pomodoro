export function ProgressBar({ progress }) {
  return (
    <div className="progress-brutal mb-8">
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}
