import {ChatType} from "@/lib/types";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {CreateChatFormData, createChatSchema} from "@/lib/schemas/createChatSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {api} from "@/app/api";


export default function CreateChatForm(props: {
    setIsCreatingChat: (isCreating: boolean) => void;
    onChatCreated?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<CreateChatFormData>({
        resolver: zodResolver(createChatSchema),
        defaultValues: {
            title: '',
            chatType: ChatType.Group,
        }
    });

    const onSubmit = async (data: CreateChatFormData) => {
        try{
            setIsSubmitting(true);
            await api.chats.add(
                {
                    title: data.title,
                    chatType: data.chatType,
                }
            )
            props.setIsCreatingChat(false);
            props.onChatCreated?.();
        }catch(error){
            console.error("Failed to create chat:", error);
            alert("Failed to create chat. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="absolute top-20 left-4 bg-surface border border-default rounded-lg shadow-xl z-20 p-6 w-96">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Create Group Chat</h2>
                <button 
                    type="button"
                    onClick={() => props.setIsCreatingChat(false)}
                    className="text-muted hover:text-primary transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Group Name</span>
                    </label>
                    <input 
                        {...register("title")} 
                        type="text" 
                        placeholder="e.g., Team Project, Study Group"
                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.title.message}</span>
                        </label>
                    )}
                </div>
                
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Chat Type</span>
                    </label>
                    <select 
                        {...register("chatType")} 
                        className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSubmitting}
                    >
                        <option value={ChatType.Group}>Group Chat</option>
                        <option value={ChatType.Channel} disabled>Channel (Coming Soon)</option>
                    </select>
                    {errors.chatType && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.chatType.message}</span>
                        </label>
                    )}
                    <label className="label">
                        <span className="label-text-alt text-muted">
                            💡 Direct chats are created automatically when you become friends
                        </span>
                    </label>
                </div>

                <div className="flex gap-3 mt-2">
                    <button 
                        type="submit" 
                        className="btn btn-primary flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Group
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-ghost flex-1" 
                        onClick={() => props.setIsCreatingChat(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}