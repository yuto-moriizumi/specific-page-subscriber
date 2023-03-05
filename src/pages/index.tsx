import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  createTheme,
  Fab,
  IconButton,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Subscription } from './api/model/Subscription';
import { DeleteForever, Add } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

type Props = { subscriptions: Subscription[]; token: string };

const theme = createTheme();
export default function Home({ subscriptions, token: defaultToken }: Props) {
  const [isTokenSnackOpen, setIsTokenSnackOpen] = useState(false);
  const [token, setToken] = useState(defaultToken);
  const updateToken = () => {
    axios
      .put('http://localhost:3000/api/token', { token })
      .then(() => setIsTokenSnackOpen(true));
  };
  return (
    <>
      <Head>
        <title>Specific Page Subscriber</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar
        open={isTokenSnackOpen}
        autoHideDuration={6000}
        onClose={() => setIsTokenSnackOpen(false)}
        message="トークンを更新しました"
      />
      <main className={inter.className}>
        <Stack spacing={2}>
          <Typography variant="h2" textAlign="center">
            Specific Page Subscriber
          </Typography>
          <Box>
            <Container maxWidth="sm">
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Token</Typography>
                <TextField
                  placeholder="Your token here"
                  defaultValue={defaultToken}
                  onChange={(v) => setToken(v.target.value)}
                />
                <Button onClick={() => updateToken()}>Submit</Button>
              </Stack>
            </Container>
          </Box>
          {subscriptions.map((subscription) => (
            <Card key={subscription.sub_url}>
              <CardActionArea href={subscription.work_url}>
                <CardMedia
                  component={Image}
                  image={subscription.image}
                  alt={subscription.sub_url}
                />
              </CardActionArea>
              <CardActions>
                <Rating />
                <Button color={subscription.has_new ? 'primary' : 'secondary'}>
                  {subscription.has_new ? 'NEW' : 'READ'}
                </Button>
                <IconButton>
                  <DeleteForever />
                </IconButton>
              </CardActions>
              <CardContent>
                <Typography>{subscription.sub_url}</Typography>
                <Typography>{subscription.title}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
        <Fab
          variant="extended"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: theme.spacing(3),
            right: theme.spacing(3),
          }}
        >
          <Add />
          <Typography>Add a new card</Typography>
        </Fab>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const {
    data: { subscriptions },
  } = await axios.get<{ subscriptions: string }>(
    'http://localhost:3000/api/subscriptions'
  );
  const {
    data: { token },
  } = await axios.get<{ token: string }>('http://localhost:3000/api/token');
  return {
    props: { subscriptions: subscriptions, token: token },
  };
}
