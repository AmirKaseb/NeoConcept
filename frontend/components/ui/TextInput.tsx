import { ChangeEventHandler } from "react";

interface IProps {
    value: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    type: string;
    placeholder?: string;
}

const TextInput = ({value, onChange, type, placeholder}: IProps) => {
    return (
        <input
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            className="bg-[#151726]/80 text-white/80 px-3 w-full py-2 rounded-xl"
        />
    );
}

export default TextInput;