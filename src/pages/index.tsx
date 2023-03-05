import Head from 'next/head';
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
  Rating,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { Subscription } from './api/model/Subscription';
import { DeleteForever, Add } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useState } from 'react';
import { Modal } from '@/components/Modal';

const DEFAULT_RANK = 3;

const inter = Inter({ subsets: ['latin'] });

type OptionalSubscription = Partial<Subscription> &
  Pick<Subscription, 'sub_url'>;
type Props = { subscriptions: OptionalSubscription[]; token: string };

const theme = createTheme({
  components: { MuiButton: { defaultProps: { variant: 'contained' } } },
});

const client = axios.create({ baseURL: 'http://localhost:3000/api' });

export default function Home({
  subscriptions: defaultSubscriptions,
  token: defaultToken,
}: Props) {
  const [snackMessage, setSnackMessage] = useState<string | undefined>(
    undefined
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetUrl, setDeleteTargetUrl] = useState<string | undefined>(
    undefined
  );
  const [token, setToken] = useState(defaultToken);
  const [subscriptions, setSubscriptions] = useState(defaultSubscriptions);
  const [url, setUrl] = useState('');
  const [rank, setRate] = useState(DEFAULT_RANK);
  const updateToken = () => {
    client
      .put('/token', { token })
      .then(() => setSnackMessage('トークンを更新しました'));
  };
  const addSubscription = () => {
    const sub_url = url;
    client
      .post<Subscription>('/subscriptions', {
        sub_url,
        rank,
      })
      .then(({ data }) =>
        setSubscriptions([
          ...subscriptions.filter((s) => s.sub_url !== url),
          data,
        ])
      );
    setSubscriptions([...subscriptions, { sub_url: url, rank }]);
    setSnackMessage('購読を追加しました');
    setIsModalOpen(false);
  };
  const updateRank = (url: string, rank: number) => {
    client
      .patch('/subscriptions/' + encodeURIComponent(url), {
        rank,
      })
      .then(() => {
        setSnackMessage('ランクを更新しました');
        setSubscriptions(
          subscriptions.map((s) => {
            if (s.sub_url === url) s.rank = rank;
            return s;
          })
        );
      });
  };
  const updateNew = (url: string, hasNew: boolean) => {
    client
      .patch('/subscriptions/' + encodeURIComponent(url), {
        has_new: hasNew,
      })
      .then(() => {
        setSnackMessage('既読を更新しました');
        setSubscriptions(
          subscriptions.map((s) => {
            if (s.sub_url === url) s.has_new = hasNew;
            return s;
          })
        );
      });
  };
  const deleteSubscription = (url: string) => {
    client.delete('/subscriptions/' + encodeURIComponent(url)).then(() => {
      setSnackMessage('既読を削除しました');
      setSubscriptions(subscriptions.filter((s) => s.sub_url !== url));
      setDeleteTargetUrl(undefined);
    });
  };
  return (
    <ThemeProvider theme={theme}>
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
        <Stack spacing={1}>
          <Typography variant="h3">新規購読を追加</Typography>
          <TextField label="URL" onChange={(v) => setUrl(v.target.value)} />
          <Rating
            value={rank}
            onChange={(_, v) => setRate(v ?? DEFAULT_RANK)}
          />
          <Button onClick={() => addSubscription()}>Submit</Button>
        </Stack>
      </Modal>
      <Modal
        open={!!deleteTargetUrl}
        onClose={() => setDeleteTargetUrl(undefined)}
      >
        <Stack spacing={1}>
          <Typography variant="h3">本当に削除しますか？</Typography>
          <Button
            onClick={() => {
              deleteSubscription(deleteTargetUrl ?? '');
            }}
          >
            Delete
          </Button>
        </Stack>
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
                spacing={1}
              >
                <Typography>Token</Typography>
                <TextField
                  placeholder="Your token here"
                  defaultValue={defaultToken}
                  onChange={(v) => setToken(v.target.value)}
                  fullWidth
                />
                <Button onClick={() => updateToken()}>Submit</Button>
              </Stack>
            </Container>
          </Box>
          <Grid container spacing={2}>
            {subscriptions.map(
              ({ sub_url, work_url, image, title, rank, has_new }) => (
                <Grid item key={sub_url} xs={12} sm={4} md={3} lg={3} xl={2}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea href={work_url ?? ''}>
                      <CardMedia
                        image={
                          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Leopold_ii_garter_knight_fix.jpg/320px-Leopold_ii_garter_knight_fix.jpg' ??
                          image
                        }
                        referrerPolicy="no-referrer"
                        component={'img'}
                      />
                    </CardActionArea>
                    <CardContent sx={{ paddingBottom: 0 }}>
                      <Typography variant="h5">{title}</Typography>
                      <Typography variant="caption">{sub_url}</Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                      <Rating
                        value={rank}
                        onChange={(_, v) =>
                          updateRank(sub_url, v ?? DEFAULT_RANK)
                        }
                      />
                      <Button
                        color={has_new ? 'primary' : 'secondary'}
                        size="small"
                        variant="contained"
                        onClick={() => updateNew(sub_url, !has_new)}
                      >
                        {has_new ? 'NEW' : 'READ'}
                      </Button>
                      <IconButton onClick={() => setDeleteTargetUrl(sub_url)}>
                        <DeleteForever />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              )
            )}
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
    </ThemeProvider>
  );
}

export async function getServerSideProps() {
  const {
    data: { subscriptions },
  } = await client.get<{ subscriptions: string }>('/subscriptions');
  const {
    data: { token },
  } = await client.get<{ token: string }>('/token');
  return {
    props: { subscriptions: subscriptions, token: token },
  };
}
