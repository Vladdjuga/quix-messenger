import {ChatType} from "@/lib/types";
import React from "react";
import {useForm} from "react-hook-form";
import {CreateChatFormData, createChatSchema} from "@/lib/schemas/createChatSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {api} from "@/app/api";


export default function CreateChatForm(props: {
    setIsCreatingChat: (isCreating: boolean) => void
}) {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<CreateChatFormData>({
        resolver: zodResolver(createChatSchema),
        defaultValues: {
            title: 'The Сhat Title',
            chatType: ChatType.Direct,
        }
    });

    const onSubmit = async (data: CreateChatFormData) => {
        try{
            await api.chats.add(
                {
                    title: data.title,
                    chatType: data.chatType,
                }
            )
            props.setIsCreatingChat(false);
        }catch(error){
            console.error("Failed to create chat:", error);
        }
    }

    return (
        <div className="absolute top-16 left-4 bg-surface border border-default rounded shadow-lg z-10 p-4">
            <h2 className="text-lg font-semibold mb-4">Create New Chat</h2>
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-control">
                    <div className={"mb-4"}>
                        <label className="label">
                            <span className="label-text">Chat Title</span>
                        </label>
                        <input {...register("title")} type="text" placeholder="Enter chat title"
                               className="input input-bordered"/>
                        {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
                    </div>
                    <div className={"mb-4"}>
                        <label className="label">
                            Select Chat type
                        </label>
                        <select {...register("chatType")} className="select select-bordered w-full max-w-xs">
                            <option disabled selected>Pick one</option>
                            <option value={ChatType.Direct}>Direct</option>
                            <option value={ChatType.Group}>Group</option>
                            <option value={ChatType.Channel}>Channel(not implemented yet)</option>
                        </select>
                        {errors.chatType && <span className="text-red-500 text-sm">{errors.chatType.message}</span>}
                    </div>
                </div>
                <button type="submit" className="btn-sm btn-primary mt-4" onClick={
                    () => props.setIsCreatingChat(false)
                }>
                    Close
                </button>
            </form>
        </div>
    )
}