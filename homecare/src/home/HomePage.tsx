import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
        <h1 className="display-4">Welcome to Lifelink</h1>
      <Carousel>
        <Carousel.Item>
          <Image src="/images/homevisit.jpg" className="d-block w-100" alt="Home Visits" />
        </Carousel.Item>
        <Carousel.Item>
          <Image src="/images/stetscope.jpeg" className="d-block w-100" alt="Experienced personnel" />
        </Carousel.Item>
        <Carousel.Item>
          <Image src="/images/sickperson.jpeg" className="d-block w-100" alt="Medical advice" />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default HomePage;