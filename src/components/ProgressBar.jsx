export function ProgressBar({ progress }) {
  return (
    <div 
      className="progress-brutal mb-11 w-full max-w-[450px] sm:max-w-[450px]" 
      style={{ 
        width: 'min(450px, 90vw)'
      }}
    >
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}
