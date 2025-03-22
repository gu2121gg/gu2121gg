const firebaseConfig = {
    apiKey: "AIzaSyDOqjTZ2edf2puBFkZrJm1DN-vc5iOqvAo",
    authDomain: "livros-9cd3a.firebaseapp.com",
    databaseURL: "https://livros-9cd3a-default-rtdb.firebaseio.com",
    projectId: "livros-9cd3a",
    storageBucket: "livros-9cd3a.firebasestorage.app",
    messagingSenderId: "425870272898",
    appId: "1:425870272898:web:4031f4c6511c4dcd49079b"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore(); // Adicione esta linha para inicializar o Firestore
  
  const authForm = document.getElementById('auth-form');
  const authButton = document.getElementById('auth-button');
  const toggleAuthLink = document.getElementById('toggle-auth');
  const errorMessageElement = document.getElementById('error-message');
  const successMessageElement = document.getElementById('success-message');
  const loadingIndicator = document.getElementById('loading-indicator');
  const nameGroup = document.getElementById('name-group');
  const lastNameGroup = document.getElementById('last-name-group');
  const paymentStatusElement = document.getElementById('payment-status');
  
  
  let isLogin = true;
  
  // Alterna entre login e cadastro
  toggleAuthLink.addEventListener('click', (event) => {
      event.preventDefault();
      isLogin = !isLogin;
      authButton.textContent = isLogin ? 'Entrar' : 'Cadastrar';
      toggleAuthLink.textContent = isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entrar';
      authForm.reset();
      hideMessage(errorMessageElement);
      hideMessage(successMessageElement);
  
      if (isLogin) {
          nameGroup.style.display = 'none';
          lastNameGroup.style.display = 'none';
      } else {
          nameGroup.style.display = 'block';
          lastNameGroup.style.display = 'block';
      }
  });
  
  // Manipula o envio do formulário
  authForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const email = authForm.email.value.trim();
      const password = authForm.password.value.trim();
      const name = isLogin ? "" : document.getElementById('name').value.trim(); // aqui
      const lastName = isLogin ? "" : document.getElementById('last-name').value.trim(); // aqui
  
  
      if (!email || !password || (!isLogin && (!name || !lastName))) {
          showMessage(errorMessageElement, 'Por favor, preencha todos os campos.');
          return;
      }
  
      showMessage(loadingIndicator);
      hideMessage(errorMessageElement);
      hideMessage(successMessageElement);
      authButton.disabled = true;
  
      if (isLogin) {
          signIn(email, password);
      } else {
          signUp(email, password, name, lastName);
      }
  });
  
  // Função para fazer login
  function signIn(email, password) {
      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
              const user = userCredential.user;
              console.log('Usuário logado:', user);
              //showMessage(successMessageElement, 'Login realizado com sucesso!');
              //authForm.reset();
              checkUserPaymentStatus(user);
          })
          .catch((error) => {
              console.error('Erro ao fazer login:', error);
              showMessage(errorMessageElement, getErrorMessage(error.code, error.message));
          })
          .finally(() => {
              hideMessage(loadingIndicator);
              authButton.disabled = false;
          });
  }
  
  // Função para cadastrar usuário
  function signUp(email, password, name, lastName) {
      auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
              const user = userCredential.user;
              console.log('Usuário cadastrado:', user);
  
              // Agora, crie o documento do usuário no Firestore.
              db.collection('users').doc(user.uid).set({
                  email: email,
                  pago: false,
                  nome: name,
                  sobrenome: lastName
              }).then(() => {
                  console.log('Usuário cadastrado e salvo no Firestore com sucesso!');
                  showMessage(successMessageElement, 'Cadastro realizado com sucesso!');
                  authForm.reset();
                  checkUserPaymentStatus(user);
              }).catch((error) => {
                  console.error('Erro ao salvar dados do usuário no Firestore:', error);
                  showMessage(errorMessageElement, 'Erro ao salvar dados do usuário.'); // Mensagem de erro para o usuário
              });
          })
          .catch((error) => {
              console.error('Erro ao cadastrar:', error);
              showMessage(errorMessageElement, getErrorMessage(error.code, error.message));
          })
          .finally(() => {
              hideMessage(loadingIndicator);
              authButton.disabled = false;
          });
  }
  
  function checkUserPaymentStatus(user) {
      db.collection('users').doc(user.uid).get()
          .then((doc) => {
              if (doc.exists) {
                  const userData = doc.data();
                  if (userData.pago) {
                      window.location.href = 'livros.html';
                  } else {
                      paymentStatusElement.textContent = 'Você precisa ser um usuário pago para acessar todo o conteúdo.';
                      paymentStatusElement.style.display = 'block';
                  }
              } else {
                  console.error('Documento do usuário não encontrado');
                  showMessage(errorMessageElement, 'Erro ao verificar o status de pagamento.');
              }
          })
          .catch((error) => {
              console.error('Erro ao buscar dados do usuário:', error);
              showMessage(errorMessageElement, 'Erro ao verificar o status de pagamento.');
          });
  }
  
  // Função para obter mensagens de erro personalizadas
  function getErrorMessage(errorCode, errorMessage) {
      switch (errorCode) {
          case 'auth/invalid-email':
              return 'Email inválido.';
          case 'auth/user-disabled':
              return 'Usuário desabilitado.';
          case 'auth/user-not-found':
              return 'Usuário não encontrado.';
          case 'auth/wrong-password':
              return 'Senha incorreta.';
          case 'auth/email-already-in-use':
              return 'Este email já está em uso.';
          case 'auth/weak-password':
              return 'A senha deve ter pelo menos 6 caracteres.';
          default:
              return 'Ocorreu um erro: ' + errorMessage;
      }
  }
  
  // Função para exibir mensagens
  function showMessage(element, message = '') {
      if (element) {
          element.textContent = message;
          element.style.display = 'block';
      }
  }
  
  // Função para ocultar mensagens
  function hideMessage(element) {
      if (element) {
          element.style.display = 'none';
      }
  }