import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


function App() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    // validate input fields
    if (!username || !password) {
      setMessage('Preencha os campos obrigatórios!');
      return;
    }

    // send authentication request to backend
    axios.post('http://localhost:8080/login', { username, password })
      .then(response => {
        console.log("token-->"+response.data.token)
        // save token to local storage
        localStorage.setItem('token', response.data.token);
        // redirect to success page
        window.location.href = '/success';
      })
      .catch(error => {
        // show error message
        setMessage('Usuário ou senha inválido!');
      });
  }

  return (
    <div className="container">
      <h1>Desafio Seec 2023</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuário:</label>
          <input type="text" id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="form-group">
          <button type="submit">Login</button>
        </div>
      </form>
      {message && <div className="error">{message}</div>}
      <p className="footer">Autorizado para fins didáticos | Autor: Luis Claudio Tavares</p>
    </div>
  );
}


function SuccessPage() {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // decrement time remaining every second
    const intervalId = setInterval(() => {
      setTimeRemaining(prevTime => prevTime - 1);
    }, 1000);

    // clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // click "Deslogar" button automatically when timeRemaining reaches zero
    if (timeRemaining <= 0) {
      handleLogout();
    }
  }, [timeRemaining]);

  function handleLogout() {
    // remove token from local storage
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');

    // send logout request to backend
    axios.post('http://localhost:8080/logoutinvalidatetoken', { token })
      .then(() => {
        // redirect to login page
        console.log("logout com sucesso, token invalidado.");
        setShowModal(true);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function handleOk() {
    setShowModal(false);
    window.location.href = '/';
  }

  return (
    <div className="container">
      <h1>Desafio Seec 2023</h1>
      <h2>Logado com sucesso</h2>
      <p>Tempo restante: {timeRemaining} segundos</p>
      <button onClick={handleLogout} className="logout-button">Deslogar</button>
      {showModal && <LogoutModal onOk={handleOk} />}
      <p className="footer">Autorizado para fins didáticos | Autor: Luis Claudio Tavares</p>
    </div>
  );
}

function LogoutModal(props) {
  function handleModalClick(event) {
    event.stopPropagation(); // bloqueia a interação com o restante da página
  }

  return (
    <div className="modal-container" onClick={props.onOk}>
      <div className="modal" onClick={handleModalClick}>
        <center>
        <h1>Desafio Seec 2023</h1>
        <p><h2>Sessão encerrada!</h2></p>
        <button onClick={props.onOk}>Clique para retornar a tela inicial!</button>
        </center>
      </div>
    </div>
  );
}

export default function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // check if user is authenticated
    const token = localStorage.getItem('token');

    console.log("token validateToken -->"+token);

    if (token) {
      // validate token with backend
      axios.post('http://localhost:8080/validatetoken', { token })
        .then(() => {
          setIsLoggedIn(true);
        })
        .catch(error => {
          setIsLoggedIn(false);
          console.error(error);
        });
    }
  }, []);

  return (
    <div>
      {isLoggedIn ? <SuccessPage /> : <App />}
    </div>
  );
}


