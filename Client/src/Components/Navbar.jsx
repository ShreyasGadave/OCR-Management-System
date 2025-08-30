import Logo from '../assets/Logo.svg'

const Navbar = () => (
    <header className="bg-gray-600 backdrop-blur-md sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-5xl  px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center space-x-2">
                    <img src={Logo} alt="" className='h-8' />
                    <h1 className="text-lg font-normal text-gray-200">Texify</h1>
                </div>
            </div>
        </div>
    </header>
);

export default Navbar