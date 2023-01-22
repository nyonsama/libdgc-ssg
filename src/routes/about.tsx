import React from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

const About = () => {
  return (
    <>
      <NavBar />
      <div className="comp-container flex-1">
        <header className="mt-16 mb-16 flex flex-col items-center">
          <h2 className="text-4xl mb-4">关于</h2>
          <p className="mb-4 text-text-secondary">施工中...</p>
        </header>
      </div>
      <Footer />
    </>
  );
};

export default About;
