import { Link } from "react-router-dom";
const ErrorPage = () => {
  return (
    <div className="app">
      <h3>
        你还没有输入信息，请点击返回{" "}
        <Link to="/home1">homepage</Link>{" "}
      </h3>
    </div>
  );
};

export default ErrorPage;
