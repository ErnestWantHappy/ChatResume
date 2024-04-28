import { useState } from 'react';//useState是 react 提供的一个定义响应式变量的 hook 函数
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Home from './components/Home';
import Home1 from './components/Home1';
import Resume from './components/Resume';
import Resume1 from './components/Resume1';
import './App.css';
import CHAT from './components/chat';
function App() {
  // state holding the result 初始化
  const [result,setResult]=useState({});
  return (
    <div> 
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<CHAT/>}></Route>
            <Route path='/home' element={<Home setResult={setResult}/>}></Route>
            <Route path='/home1' element={<Home1 setResult={setResult}/>}></Route>
            <Route path='/resume' element={<Resume result={result}/>}></Route>
            <Route path='/resume1' element={<Resume1 result={result}/>}></Route>
        </Routes>  
      </BrowserRouter>
    </div>
  );
}

export default App;
