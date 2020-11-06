import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import HeaderComponent from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <HeaderComponent currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (context) => {
  const { data } = await buildClient(context.ctx).get('/api/users/currentuser');

  //when you have this method at compoenent lvl, the page lvl getInitialProps get stop auto calling, need to call manually
  let pageProps = {};
  if (context.Component.getInitialProps) {
    pageProps = await context.Component.getInitialProps(context.ctx);
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
