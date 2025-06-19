import LogoTitle from './logo-title';
import ModeToggle from './mode-toggle';
import Search from './search-bar';
import UserButton from './user-btn';
import CartIcon from './cart-icon';

const Header = () => {
  return (
    <header className="w-full flex flex-col border-b">
      <div className="flex p-4 bg-background">
        <div className="flex-2">
          <LogoTitle />
        </div>
        <div className="flex-8 flex justify-center">
          <Search />
        </div>
        <div className="flex-2 flex justify-end">
          <div className="flex items-center">
            <ModeToggle />
            <div className="border-l-2 border-gray-300 h-6 ml-4 mr-2"></div>
          </div>
          <div className="flex space-x-2 mr-4">
            <UserButton />
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
