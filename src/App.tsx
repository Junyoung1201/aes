import React, { KeyboardEvent, useEffect, useRef, useState } from "react"
import './App.css';
import { ERR_DECRYPT, ERR_ENCRYPT, ERR_IV_WRONG_CHAR, ERR_IV_WRONG_LEN, ERR_KEY_WRONG_CHAR, ERR_KEY_WRONG_LEN_16, ERR_KEY_WRONG_LEN_32 } from "strings";

export default function App() {
    const [encrypt,setEncrypt] = useState<boolean>(false);
    const [bit,setBit] = useState<number>(256);
    const [keyLength,setKeyLength] = useState<number>(32);
    const [error,setError] = useState<string | undefined>();

    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const keyInputRef = useRef<HTMLInputElement>(null);
    const ivInputRef = useRef<HTMLInputElement>(null);
    const outputInputRef = useRef<HTMLTextAreaElement>(null);
    
    const DEBUG = true;

    useEffect(() => {
        function clearError(e: globalThis.KeyboardEvent) {

            if(["textarea","input"].includes((e.target as HTMLElement).tagName.toLowerCase())) {
                setError(undefined);
            }
        }

        window.addEventListener('keydown', clearError);

        return () => {
            window.removeEventListener('keydown', clearError);
        }
    },[])

    useEffect(() => {
        setError(undefined)

        if(textInputRef.current && keyInputRef.current && ivInputRef.current && outputInputRef.current) {
            textInputRef.current.value = "";
            keyInputRef.current.value = "";
            ivInputRef.current.value = "";
            outputInputRef.current.value = "";
        }
        
    },[encrypt,textInputRef,keyInputRef,ivInputRef,outputInputRef])

    useEffect(() => {
        if(bit === 256) {
            setKeyLength(32);
        }

        if(bit === 128) {
            setKeyLength(16);
        }
    },[bit])

    //@ts-nocheck
    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let rawText = textInputRef.current.value!;

        let keyStr = keyInputRef.current.value!;
        let ivStr = ivInputRef.current.value!;

        let outputEl = outputInputRef.current!;
        let outputText = "";

        // 입력 오류 검사
        if(encodeURIComponent(ivStr).includes("%")) {
            setError(ERR_IV_WRONG_CHAR)
            return;
        }

        if(encodeURIComponent(keyStr).includes("%")) {
            setError(ERR_KEY_WRONG_CHAR)
            return;
        }

        if(ivStr.length !== 16) {
            setError(ERR_IV_WRONG_LEN);
            return;
        }

        if(bit === 128) {

            // aes-128일 경우 키는 16 바이트
            if(keyStr.length !== 16) {
                setError(ERR_KEY_WRONG_LEN_16)
                return;
            }
        }

        else if(bit === 256) {

            // aes-256일 경우 키는 32 바이트
            if(keyStr.length !== 32) {
                setError(ERR_KEY_WRONG_LEN_32)
                return;
            }
        }

        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let iv = CryptoJS.enc.Utf8.parse(ivStr);

        let config = {
            iv,
            mode: CryptoJS.mode.CBC
        }

        if(bit === 128) {
            config["padding"] = CryptoJS.pad.Pkcs7;
        }

        if(encrypt) {

            /*  암호화  */
            
            outputText = CryptoJS.AES.encrypt(rawText, key, config).toString();

        } else {
            /*  복호화  */

            outputText = CryptoJS.AES.decrypt(rawText, key, config).toString(CryptoJS.enc.Utf8);
        }

        if(outputText === undefined || outputText.length <= 0) {
            setError(encrypt ? ERR_ENCRYPT : ERR_DECRYPT)

        } else {
            outputEl.value = outputText;
        }
    }

    function onChange_BitSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        console.log(e.target.value);

        switch(e.target.value) {
            case "128 비트":
                setBit(128);
                break;

            case "256 비트":
                setBit(256)
                break;
        }
    }

    return (
        <div id="app">
            <div style={{textAlign:'center'}}>AES-CBC</div>
            <div className="menu">
                <div data-selected={encrypt} onClick={() => setEncrypt(true)}>암호화</div>
                <div data-selected={!encrypt} onClick={() => setEncrypt(false)}>복호화</div>
            </div>

            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="text-input">
                        { encrypt ? "암호화할 텍스트" : "복호화할 텍스트" }
                    </label>
                    <textarea id="text-input" ref={textInputRef} required defaultValue={DEBUG && "테스트 텍스트"}></textarea>
                </div>

                <div>
                    <label htmlFor="bit-select">비트</label>
                    <select id="bit-select" onChange={onChange_BitSelect} defaultValue="256 비트">
                        <option>128 비트</option>
                        <option>256 비트</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="key-input">키</label>
                    <input 
                        type="text"
                        id="key-input"
                        ref={keyInputRef}
                        placeholder={keyLength+"자의 키 문자열을 입력해주세요."}
                        minLength={keyLength}
                        maxLength={keyLength}
                        defaultValue={DEBUG && "Fqrk7mIZa2bkvbS4HTaxzNJDkwYYtQ14"}
                    />
                </div>

                <div>
                    <label htmlFor="iv-input">IV</label>
                    <input 
                        type="text"
                        id="iv-input"
                        ref={ivInputRef}
                        placeholder="16자의 초기화 벡터 문자열을 입력해주세요."
                        minLength={16}
                        maxLength={16}
                        defaultValue={DEBUG && "a1pAY58AEt4u9wML"}
                    />
                </div>

                <button id="submit-btn">{encrypt ? "암호화" : "복호화"}</button>
            </form>

            <div className="result">
                <label htmlFor="result-output">결과</label>
                <textarea id="result-output" ref={outputInputRef} placeholder="결과가 여기에 표시됩니다."></textarea>
                {
                    error !== undefined &&
                    <div className="error">
                        {error}
                    </div>
                }
            </div>
        </div>
    )
}