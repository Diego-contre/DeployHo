import { useState } from "react";
import { login } from "./api/authApi";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const respuesta = await login({
                username,
                password,
            });

            console.log("Login correcto:", respuesta);
            window.location.href = "/perfil";
        } catch (error) {
            console.error("Error en login:", error);
            alert(error.message || "Error al iniciar sesión");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Iniciar sesión</h1>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button type="submit">Entrar</button>
        </form>
    );
}

export default Login;