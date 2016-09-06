using System;
using System.IO;

namespace ServerSent
{
    public class EventSource
    {
        public Stream Stream { get; }

        public EventSource(Stream stream)
        {
            Stream = stream;
        }

        public bool Write(object data, string type)
        {
            var message = $"type: {type}\ndata: {data}\n\n";

            return Write(message);
        }

        public bool Write(object data)
        {
            var message = $"data: {data}\n\n";

            return Write(message);
        }

        private bool Write(string message)
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
                // Maybe log this?
                return false;
            }

            return true;
        }
    }
}
