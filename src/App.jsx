import { useEffect } from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import { useRef } from 'react';

function App() {
    const [place, setPlace] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    function search(e) {
        e.preventDefault();
        if (place.length > 2) {
            setLoading(true);
            const requestOptions = {
                method: 'GET',
            };
            fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${place}&apiKey=${
                    import.meta.env.VITE_APIKEY
                }`,
                requestOptions
            )
                .then((response) => response.json())
                .then((result) => {
                    setResults(result.features);
                    setLoading(false);
                })
                .catch((error) => console.log('error', error));
        }
    }
    function showPrevAddresses() {
        if (localStorage.getItem('prevAddresses')) {
            let prevAddresses = JSON.parse(
                localStorage.getItem('prevAddresses')
            );
            prevAddresses = prevAddresses.map((str) => JSON.parse(str));
            setResults(prevAddresses);
        }
    }

    function setPrevAddress(obj) {
        let prevAddresses = [];
        if (localStorage.getItem('prevAddresses')) {
            prevAddresses = JSON.parse(localStorage.getItem('prevAddresses'));
            if (!prevAddresses.includes(JSON.stringify(obj))) {
                prevAddresses.push(JSON.stringify(obj));
                if (prevAddresses.length > 5) prevAddresses.shift();
                localStorage.setItem(
                    'prevAddresses',
                    JSON.stringify(prevAddresses)
                );
            }
        } else {
            prevAddresses.push(JSON.stringify(obj));
            localStorage.setItem(
                'prevAddresses',
                JSON.stringify(prevAddresses)
            );
        }
    }
    function handleClickInside() {
        showPrevAddresses();
    }

    function handleClickOutside(event) {
        if (inputRef.current && !inputRef.current.contains(event.target)) {
            setResults([]);
        }
    }

    useEffect(() => {
        inputRef.current.addEventListener('focus', handleClickInside);
        document.addEventListener('click', handleClickOutside);
        return () => {
            inputRef.current.removeEventListener('focus', handleClickInside);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className='App'>
            <Form>
                <Form.Group
                    style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Form.Control
                        ref={inputRef}
                        onChange={(e) => {
                          if(e.target.value ===""){
                            setResults([])
                          }
                          setPlace(e.target.value)}
                        }
                        value={place}
                        type='text'
                        placeholder='Enter Place'
                    />
                    {loading && (
                        <Spinner
                            size='sm'
                            style={{ position: 'absolute', right: '8px' }}
                            animation='border'
                            role='status'
                        >
                            <span className='visually-hidden'>Loading...</span>
                        </Spinner>
                    )}
                </Form.Group>
                {results.length > 0 && (
                    <ListGroup>
                        {results?.map((obj) => {
                            let address =
                                obj?.properties?.address_line1 +
                                ', ' +
                                obj?.properties?.address_line2;
                            return (
                                <ListGroup.Item
                                    onClick={() => {
                                        setPrevAddress(obj);
                                        setPlace('');
                                    }}
                                    key={address}
                                    action
                                    variant='light'
                                >
                                    {address}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                )}
                <Button
                    className='mt-3'
                    onClick={(e) => search(e)}
                    variant='primary'
                    type='submit'
                >
                    Search
                </Button>
            </Form>
        </div>
    );
}

export default App;
