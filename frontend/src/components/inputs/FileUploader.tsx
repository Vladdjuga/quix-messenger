import { useDropzone } from "react-dropzone";

interface Props {
    onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({ onFilesSelected }: Props) {
    const { getRootProps, getInputProps, isDragActive  } = useDropzone({
        onDrop: onFilesSelected,
        accept: {
            "image/*": [],
            "application/pdf": [],
            "video/*": [],
            "text/*": []
        },
        multiple: true
    });

    return (
        <div
            {...getRootProps({
                className: `p-2 rounded-lg cursor-pointer transition ${
                    isDragActive ? "bg-accent/20" : "hover:bg-accent/10"
                }`
            })}
        >
            <input {...getInputProps()} />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
            </svg>
        </div>
    );
}