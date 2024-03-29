import { FormEvent, MouseEvent, useState, useEffect , useRef  } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation} from 'react-i18next';


import {LoginDTO} from '../dto/loginDTO.tsx';
import {ResponseDTO} from '../dto/responseDTO.tsx';
import {AuthenticationBO} from '../business_logic/autheticationBO';
import wizCRMLogo from '../assets/wizCRM.jpg'

import {getFormElementValueAsString,delay} from '../utils/pageUtil.tsx';
import { ErrorDTO } from '../dto/errorDTO.tsx';

const defaultTheme = createTheme();

function Login() {

    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [loginDto, setLoginDto] = useState(new LoginDTO("",""));
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(new ErrorDTO(0,"")); // Segnala la presenza di eventuali Errori
    //const renderCount  = useRef(0);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    async function handleSubmit(event:FormEvent<HTMLFormElement>) {

        event.preventDefault(); // blocca la gestione di default dell'evento

        /*
        E' l'unico modo per condividere dei valori 
        all'interno del componente senza perdere i valori
        */
        loginDto.userName = getFormElementValueAsString(event,"email");
        loginDto.password = getFormElementValueAsString(event,"password");

        // QUI È POSSIBILE GESTIRE EVENTUALI ERRORI SUI DATI DI INPUT

        setLoading(true);
    } 

    useEffect(() => {
        //renderCount.current = renderCount.current + 1;

        if (loading === false) return; // E' l'unico modo per non chiamare più volte la webapi

        const callWebAPI = async () => {
            let bo:AuthenticationBO = new AuthenticationBO();
            let dataResponse:ResponseDTO = new ResponseDTO();

            try {
                dataResponse = await bo.doLogin(loginDto);
            } catch {} // La gestione degli errori è nella classe di Business Logic

            await delay(500);
            setLoading(false);
            await processResponse(dataResponse);
        }

        callWebAPI();

    },[loading]);

    async function processResponse(data:ResponseDTO) {
        if (data == null) {
            console.log("Login Response Data is null");
            setError(new ErrorDTO(1,t('loginPage.errorServerError')));
            return;
        }

        if (1 === data.error.code) {
            setError(new ErrorDTO(1,t('loginPage.errorServerError')));
        } else if (10 === data.error.code) {
            setError(new ErrorDTO(10,t('loginPage.errorInvalidCredentials')));
        } else {
            setError(new ErrorDTO(0,"")); // Questa riga sarà eliminata
            /*
            - Setta la lingua dell'applicazione con quella dell'utente
            - Salva loggetto User in una variabile di Stato
            - Nella parte di Rendering, se l'oggetto utente è presente esegue un codice simile a:
              https://stackoverflow.com/questions/74395749/how-to-store-user-data-in-context-and-using-it-on-other-components-reactjs

              In questo modo l'utente approderà al menù principale dell'applicazione
            */
        }
    }

    return (
           <>
                <ThemeProvider theme={defaultTheme}>
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <Box
                            sx={{
                                border:0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <a href="https://it.wikipedia.org/wiki/Ovibos_moschatus" target="_blank">
                                    <img src={wizCRMLogo} className="logo" alt="WizCRM" />
                                </a>
                                <Typography variant="h4">
                                    <Box sx={{ fontWeight: 'bold'}}>wizCRM v1.0</Box>
                                </Typography>
                            </Box>
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <TextField
                                    error={error.code > 0}
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label={t('loginPage.email')}
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                />
                                <TextField
                                    error={error.code > 0}
                                    helperText={error.message}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label={t('loginPage.password')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="password"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                                            <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}>
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                    </InputAdornment>
                                    }}
                                />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                            >
                                {t('loginPage.signIn')}
                                </Button>
                            </Box>
                        </Box>

                        {loading &&
                            <>
                                <Backdrop
                                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                        open={true}>

                                        <CircularProgress color="inherit" />
                                </Backdrop>
                            </>
                        }
                        
                    </Container>
                </ThemeProvider>
                {/*renderCount.current*/}
            </>
    );
}

export default Login;
