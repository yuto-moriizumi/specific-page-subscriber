import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import axios from 'axios';
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Fab,
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Subscription } from './api/model/Subscription';
import { Data } from './api/subscriptions';
import { DeleteForever, Add } from '@mui/icons-material';

const inter = Inter();

type Props = { subscriptions: Subscription[]; token: string };

export default function Home({ subscriptions, token }: Props) {
  return (
    <>
      <Head>
        <title>Specific Page Subscriber</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <Stack>
          <Typography>Specific Page Subscriber</Typography>
          <Stack direction="row">
            <Typography>Token</Typography>
            <TextField placeholder="Your token here" defaultValue={token} />
            <Button>Submit</Button>
          </Stack>
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
        <Fab color="primary" aria-label="add">
          <Add />
          <Typography>Add a new card</Typography>
        </Fab>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const { data } = await axios.get<Data>(
    'http://localhost:3000/api/subscriptions'
  );
  const res = await axios.get<{ token: string }>(
    'http://localhost:3000/api/token'
  );
  return { props: { subscriptions: data, token: res.data.token } };
}
