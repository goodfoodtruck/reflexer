interface ErrorAlertProps {
    error: string
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
    return (
        <div className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
            { error }
        </div>
    )
}

export default ErrorAlert