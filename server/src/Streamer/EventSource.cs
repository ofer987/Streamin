using System;
using System.IO;

namespace Streamer
{
    public class EventSource
    {
        public Stream Stream { get; }

        public EventSource(Stream stream)
        {
            Stream = stream;
        }

        public void Write(object data, string type)
        {
            var message = $"type: {type}\ndata: {data}\n\n";

            Write(message);
        }

        public void Write(object data)
        {
            var message = $"data: {data}\n\n";

            Write(message);
        }

        private void Write(string message)
        {
            try
            {
                foreach (var ch in message.ToCharArray())
                {
                    Stream.WriteByte((byte)ch);
                }
                Stream.Flush();
            }
            catch(Exception)
            {
                throw;
            }
        }
    }
}
