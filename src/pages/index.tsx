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
  Grid,
  IconButton,
  Modal,
  Paper,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Subscription } from './api/model/Subscription';
import { DeleteForever, Add } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useState } from 'react';
import { Item } from 'dynamoose/dist/Item';

const DEFAULT_RANK = 3;

const inter = Inter({ subsets: ['latin'] });

type Props = { subscriptions: Subscription[]; token: string };

const theme = createTheme();
export default function Home({ subscriptions, token: defaultToken }: Props) {
  const [snackMessage, setSnackMessage] = useState<string | undefined>(
    undefined
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(defaultToken);
  const [url, setUrl] = useState('');
  const [rank, setRate] = useState(DEFAULT_RANK);
  const updateToken = () => {
    axios
      .put('http://localhost:3000/api/token', { token })
      .then(() => setSnackMessage('トークンを更新しました'));
  };
  const addSubscription = () => {
    axios
      .post('http://localhost:3000/api/subscriptions', { sub_url: url, rank })
      .then(() => setSnackMessage('購読を追加しました'));
    setIsModalOpen(false);
  };
  return (
    <>
      <Head>
        <title>Specific Page Subscriber</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar
        open={!!snackMessage}
        autoHideDuration={6000}
        onClose={() => setSnackMessage(undefined)}
        message={snackMessage}
      />
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Container
          maxWidth="sm"
          sx={{
            position: 'relative',
            top: '50%',
            transform: 'translate(0%, -50%)',
          }}
        >
          <Paper sx={{ padding: '1rem' }}>
            <Stack spacing={1}>
              <Typography variant="h3">新規購読を追加</Typography>
              <TextField label="URL" onChange={(v) => setUrl(v.target.value)} />
              <Rating
                value={rank}
                onChange={(_, v) => setRate(v ?? DEFAULT_RANK)}
              />
              <Button onClick={() => addSubscription()}>Submit</Button>
            </Stack>
          </Paper>
        </Container>
      </Modal>
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
          <Grid container spacing={2}>
            {subscriptions.map((subscription) => (
              <Grid key={subscription.sub_url} xs={12} sm={4} md={3} lg={2}>
                <Card>
                  <CardActionArea href={subscription.work_url}>
                    <CardMedia
                      image={
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Leopold_ii_garter_knight_fix.jpg/320px-Leopold_ii_garter_knight_fix.jpg' ??
                        subscription.image
                      }
                      referrerPolicy="no-referrer"
                      component={'img'}
                    />
                  </CardActionArea>
                  <CardActions>
                    <Rating readOnly value={subscription.rank} />
                    <Button
                      color={subscription.has_new ? 'primary' : 'secondary'}
                    >
                      {subscription.has_new ? 'NEW' : 'READ'}
                    </Button>
                    <IconButton>
                      <DeleteForever />
                    </IconButton>
                  </CardActions>
                  <CardContent sx={{ padding: '0.5rem' }}>
                    <Typography>{subscription.sub_url}</Typography>
                    <Typography>{subscription.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>

        <Fab
          variant="extended"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: theme.spacing(3),
            right: theme.spacing(3),
          }}
          onClick={() => setIsModalOpen(true)}
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
